import { NextRequest, NextResponse } from 'next/server'
import { ChatXAI } from '@langchain/xai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { prisma } from '../../../lib/database'
import { searchRelevant } from '../../lib/retrival'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import mammoth from 'mammoth'

interface GrokProcessingRequest {
  userPrompt: string
  searchQuery?: string
}

interface GrokProcessingResponse {
  success: boolean
  result?: string
  error?: string
  agentSteps?: AgentStep[]
  generatedFile?: string
  fileName?: string
  logs?: string[]
  tokenUsage?: TokenUsage
  processedFiles?: ProcessedFileInfo[]
  toolExecutionPlan?: ToolExecutionPlan
}

interface ProcessedFileInfo {
  fileId: string
  fileName: string
  originalName: string
  contentLength: number
  fileSize: number
  url: string
}

interface TokenUsage {
  totalTokens: number
  promptTokens: number
  completionTokens: number
  totalCost?: number
  breakdown: {
    toolPlanning: {
      totalTokens: number
      promptTokens: number
      completionTokens: number
    }
    toolExecution: {
      totalTokens: number
      promptTokens: number
      completionTokens: number
      calls: number
    }
    finalResponse: {
      totalTokens: number
      promptTokens: number
      completionTokens: number
    }
  }
}

interface AgentStep {
  step: number
  phase: 'planning' | 'execution' | 'final'
  tool?: string
  args?: any[]
  result: string
  timestamp: string
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

interface ToolExecutionPlan {
  tools: string[]
  reasoning: string
  executionOrder: string[]
}

interface ToolCall {
  tool: string
  args: any[]
}

// Cost calculation utility
function calculateTokenCost(promptTokens: number, completionTokens: number): number {
  // Grok-4 pricing (as of 2024): $0.10 per 1M input tokens, $0.30 per 1M output tokens
  const inputCostPerToken = 0.10 / 1000000  // $0.10 per 1M tokens
  const outputCostPerToken = 0.30 / 1000000 // $0.30 per 1M tokens
  
  const inputCost = promptTokens * inputCostPerToken
  const outputCost = completionTokens * outputCostPerToken
  
  return inputCost + outputCost
}

// Logger utility
class ProcessingLogger {
  private logs: string[] = []
  
  log(message: string, data?: any) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}${data ? ` | Data: ${JSON.stringify(data)}` : ''}`
    this.logs.push(logEntry)
    console.log(logEntry)
  }
  
  getLogs() {
    return this.logs
  }
}

// File content extraction utilities
async function extractFileContent(fileBuffer: Buffer, fileName: string, logger: ProcessingLogger): Promise<string> {
  const fileExtension = fileName.split('.').pop()?.toLowerCase()
  
  logger.log(`Extracting content from file: ${fileName} (type: ${fileExtension})`)
  
  try {
    switch (fileExtension) {
      case 'pdf':
        return await extractPDFContent(fileBuffer, logger)
      case 'doc':
      case 'docx':
        return await extractWordContent(fileBuffer, logger)
      case 'txt':
        return await extractTextContent(fileBuffer, logger)
      case 'rtf':
        return await extractRTFContent(fileBuffer, logger)
      case 'json':
        return await extractJSONContent(fileBuffer, logger)
      default:
        logger.log(`Unsupported file type: ${fileExtension}, treating as text`)
        return await extractTextContent(fileBuffer, logger)
    }
  } catch (error) {
    logger.log(`Error extracting content from ${fileName}: ${error}`)
    throw new Error(`Failed to extract content from ${fileName}: ${error}`)
  }
}

async function extractPDFContent(buffer: Buffer, logger: ProcessingLogger): Promise<string> {
  try {
    // Convert buffer to Blob for PDFLoader
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    if (arrayBuffer instanceof SharedArrayBuffer) {
      throw new Error('SharedArrayBuffer is not supported for PDF processing')
    }
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
    
    // Use PDFLoader with the blob
    const loader = new PDFLoader(blob)
    const docs = await loader.load()
    
    // Extract text from all pages
    const text = docs.map(doc => doc.pageContent).join('\n')
    
    logger.log(`PDF content extracted, pages: ${docs.length}, text length: ${text.length}`)
    return text
  } catch (error) {
    logger.log(`PDF parsing error: ${error}`)
    throw error
  }
}

async function extractWordContent(buffer: Buffer, logger: ProcessingLogger): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    logger.log(`Word document content extracted, text length: ${result.value.length}`)
    return result.value
  } catch (error) {
    logger.log(`Word document parsing error: ${error}`)
    throw error
  }
}

async function extractTextContent(buffer: Buffer, logger: ProcessingLogger): Promise<string> {
  try {
    const text = buffer.toString('utf-8')
    logger.log(`Text content extracted, length: ${text.length}`)
    return text
  } catch (error) {
    logger.log(`Text parsing error: ${error}`)
    throw error
  }
}

async function extractRTFContent(buffer: Buffer, logger: ProcessingLogger): Promise<string> {
  try {
    // For RTF, we'll try to extract as text first, then use a simple RTF parser if needed
    const text = buffer.toString('utf-8')
    // Simple RTF to text conversion (remove RTF markup)
    const cleanText = text.replace(/\\[a-z0-9-]+\d?/g, '').replace(/\{|\}/g, '').trim()
    logger.log(`RTF content extracted, original length: ${text.length}, cleaned length: ${cleanText.length}`)
    return cleanText
  } catch (error) {
    logger.log(`RTF parsing error: ${error}`)
    throw error
  }
}

async function extractJSONContent(buffer: Buffer, logger: ProcessingLogger): Promise<string> {
  try {
    const jsonContent = JSON.parse(buffer.toString('utf-8'))
    const textContent = JSON.stringify(jsonContent, null, 2)
    logger.log(`JSON content extracted, text length: ${textContent.length}`)
    return textContent
  } catch (error) {
    logger.log(`JSON parsing error: ${error}`)
    throw error
  }
}

// Fetch relevant files from vector database
async function fetchRelevantFiles(userPrompt: string, searchQuery: string, logger: ProcessingLogger): Promise<ProcessedFileInfo[]> {
  try {
    logger.log(`Fetching relevant files from vector database`)
    
    // Use the search query or user prompt for vector search
    const query = searchQuery || userPrompt
    
    // Get top 5 relevant chunks from vector database
    const relevantChunks = await searchRelevant(query, 5)
    logger.log(`Found ${relevantChunks.length} relevant chunks from vector search`)
    
    if (relevantChunks.length === 0) {
      logger.log(`No relevant chunks found in vector database`)
      return []
    }
    
    // Extract unique file IDs from chunks
    // The embeddingId format is {filename}__{chunkIndex}, we need to extract the filename
    const fileIds = [...new Set(relevantChunks.map(chunk => {
      const embeddingId = chunk.metadata?.fileId || chunk.id
      if (embeddingId && embeddingId.includes('__')) {
        // Extract filename from embeddingId format: {filename}__{chunkIndex}
        return embeddingId.split('__')[0]
      }
      return embeddingId
    }).filter(Boolean))]
    
    logger.log(`Extracted ${fileIds.length} unique file IDs from chunks: ${fileIds.join(', ')}`)
    
    // Get file information from database by matching fileName
    const fileInfos = await prisma.embeddingJob.findMany({
      where: { 
        fileName: { in: fileIds }
      },
      select: {
        id: true,
        fileName: true,
        originalName: true,
        fileType: true,
        fileSize: true,
        filePath: true,
        totalChunks: true,
        status: true,
        createdAt: true
      }
    })
    
    logger.log(`Retrieved ${fileInfos.length} file records from database`)
    
    // Process files and fetch their content
    const processedFiles: ProcessedFileInfo[] = []
    const uniqueFiles = new Set<string>() // Track unique files to avoid duplicates
    
    for (const fileInfo of fileInfos) {
      if (!fileInfo.filePath || uniqueFiles.has(fileInfo.id)) {
        continue
      }
      
      uniqueFiles.add(fileInfo.id)
      
      try {
        logger.log(`Fetching file from URL: ${fileInfo.filePath}`)
        
        const fileResponse = await fetch(fileInfo.filePath)
        
        if (!fileResponse.ok) {
          logger.log(`Failed to fetch file from URL: ${fileInfo.filePath} (${fileResponse.status})`)
          continue
        }
        
        const fileBuffer = Buffer.from(await fileResponse.arrayBuffer())
        const fileContent = await extractFileContent(fileBuffer, fileInfo.originalName, logger)
        
        processedFiles.push({
          fileId: fileInfo.id,
          fileName: fileInfo.fileName,
          originalName: fileInfo.originalName,
          contentLength: fileContent.length,
          fileSize: fileInfo.fileSize || 0,
          url: fileInfo.filePath
        })
        
        logger.log(`Successfully processed file: ${fileInfo.originalName}`)
        
      } catch (error) {
        logger.log(`Error processing file ${fileInfo.originalName}: ${error}`)
        continue
      }
    }
    
    logger.log(`Successfully processed ${processedFiles.length} files`)
    return processedFiles
    
  } catch (error) {
    logger.log(`Error fetching relevant files: ${error}`)
    return []
  }
}

// Tool implementations
const createTools = (logger: ProcessingLogger, processedFiles: ProcessedFileInfo[]) => ({
  // Get all processed files content
  getAllFiles: async () => {
    try {
      logger.log(`Getting all processed files content`)
      
      let allFilesContent = ''
      
      for (const fileInfo of processedFiles) {
        logger.log(`Processing file: ${fileInfo.originalName}`)
        
        try {
          const fileResponse = await fetch(fileInfo.url)
          
          if (!fileResponse.ok) {
            allFilesContent += `\n\nFailed to fetch file: ${fileInfo.originalName} (${fileResponse.status})`
            continue
          }
          
          const fileBuffer = Buffer.from(await fileResponse.arrayBuffer())
          const fileContent = await extractFileContent(fileBuffer, fileInfo.originalName, logger)
          
          allFilesContent += `\n\n=== FILE: ${fileInfo.originalName} ===\nSize: ${fileBuffer.length} bytes\nContent:\n${fileContent}`
          
        } catch (error) {
          allFilesContent += `\n\nError processing file: ${fileInfo.originalName} - ${error}`
        }
      }
      
      return allFilesContent || 'No files were successfully processed'
      
    } catch (error) {
      logger.log(`Get all files error: ${error}`)
      return `Error processing files: ${error}`
    }
  },

  // Get a specific file by name
  getFile: async (fileName: string) => {
    try {
      logger.log(`Getting specific file: ${fileName}`)
      
      const fileInfo = processedFiles.find(f => 
        f.originalName === fileName || 
        f.fileName === fileName ||
        f.originalName.toLowerCase().includes(fileName.toLowerCase())
      )
      
      if (!fileInfo) {
        return `File not found: ${fileName}. Available files: ${processedFiles.map(f => f.originalName).join(', ')}`
      }
      
      const fileResponse = await fetch(fileInfo.url)
      
      if (!fileResponse.ok) {
        return `Failed to fetch file: ${fileResponse.status}`
      }
      
      const fileBuffer = Buffer.from(await fileResponse.arrayBuffer())
      const fileContent = await extractFileContent(fileBuffer, fileInfo.originalName, logger)
      
      return `File: ${fileInfo.originalName}\nSize: ${fileBuffer.length} bytes\n\nContent:\n${fileContent}`
      
    } catch (error) {
      logger.log(`Get file error: ${error}`)
      return `Error fetching file: ${error}`
    }
  },

  // Edit text with AI assistance
  edit: async (text: string, instruction: string) => {
    try {
      logger.log(`Editing text with instruction: "${instruction}"`)
      
      // For now, return a placeholder. In a real implementation, you might want to use Grok to edit the text
      const editedText = `[EDITED] ${text}\n\nEdit instruction: ${instruction}\n\nNote: This is a placeholder for AI-powered text editing.`
      
      logger.log(`Text editing completed`)
      return editedText
      
    } catch (error) {
      logger.log(`Edit error: ${error}`)
      return `Error editing text: ${error}`
    }
  },

  // Analyze content for specific patterns or extract information
  analyze: async (content: string, analysisType: string) => {
    try {
      logger.log(`Analyzing content for: ${analysisType}`)
      
      const analysisTypes = {
        'structure': 'Document structure and organization',
        'entities': 'Named entities (people, organizations, locations)',
        'sentiment': 'Sentiment analysis',
        'keywords': 'Key terms and concepts',
        'summary': 'Content summary',
        'legal': 'Legal terms and clauses',
        'dates': 'Important dates and timelines'
      }
      
      const analysisDescription = analysisTypes[analysisType as keyof typeof analysisTypes] || analysisType
      
      const analysis = `Analysis Type: ${analysisDescription}\n\nContent Length: ${content.length} characters\nContent Preview: ${content.substring(0, 300)}...\n\nNote: This is a placeholder for AI-powered content analysis.`
      
      logger.log(`Analysis completed for type: ${analysisType}`)
      return analysis
      
    } catch (error) {
      logger.log(`Analysis error: ${error}`)
      return `Error analyzing content: ${error}`
    }
  },

  // Extract specific information from content
  extract: async (content: string, extractionType: string) => {
    try {
      logger.log(`Extracting ${extractionType} from content`)
      
      const extractionTypes = {
        'dates': 'Dates and timestamps',
        'emails': 'Email addresses',
        'phones': 'Phone numbers',
        'urls': 'URLs and links',
        'numbers': 'Numerical values',
        'quotes': 'Quoted text',
        'lists': 'List items',
        'headings': 'Section headings'
      }
      
      const extractionDescription = extractionTypes[extractionType as keyof typeof extractionTypes] || extractionType
      
      // Basic extraction logic (in real implementation, use regex or AI)
      let extracted = ''
      switch (extractionType) {
        case 'dates':
          const dateRegex = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/g
          extracted = content.match(dateRegex)?.join(', ') || 'No dates found'
          break
        case 'emails':
          const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
          extracted = content.match(emailRegex)?.join(', ') || 'No emails found'
          break
        case 'urls':
          const urlRegex = /https?:\/\/[^\s]+/g
          extracted = content.match(urlRegex)?.join(', ') || 'No URLs found'
          break
        default:
          extracted = `Extraction type "${extractionType}" not implemented. Content preview: ${content.substring(0, 200)}...`
      }
      
      const result = `Extracted ${extractionDescription}:\n${extracted}`
      
      logger.log(`Extraction completed for type: ${extractionType}`)
      return result
      
    } catch (error) {
      logger.log(`Extraction error: ${error}`)
      return `Error extracting content: ${error}`
    }
  },

  // Get files information
  getFilesInfo: async () => {
    try {
      logger.log(`Getting files information`)
      
      let filesInfo = ''
      
      for (const fileInfo of processedFiles) {
        filesInfo += `\n\n=== FILE: ${fileInfo.originalName} ===\nFile Name: ${fileInfo.fileName}\nSize: ${fileInfo.fileSize} bytes\nContent Length: ${fileInfo.contentLength} characters\nURL: ${fileInfo.url}`
      }
      
      logger.log(`Files info retrieved`)
      return filesInfo || 'No files found'
      
    } catch (error) {
      logger.log(`Get files info error: ${error}`)
      return `Error getting files info: ${error}`
    }
  },

  // Merge two files
  mergeFiles: async (file1Name: string, file2Name: string, mergeStrategy: string = 'append') => {
    try {
      logger.log(`Merging files: ${file1Name} and ${file2Name} with strategy: ${mergeStrategy}`)
      
      const file1Info = processedFiles.find(f => 
        f.originalName === file1Name || 
        f.fileName === file1Name ||
        f.originalName.toLowerCase().includes(file1Name.toLowerCase())
      )
      const file2Info = processedFiles.find(f => 
        f.originalName === file2Name || 
        f.fileName === file2Name ||
        f.originalName.toLowerCase().includes(file2Name.toLowerCase())
      )
      
      if (!file1Info) {
        return `File 1 not found: ${file1Name}. Available files: ${processedFiles.map(f => f.originalName).join(', ')}`
      }
      
      if (!file2Info) {
        return `File 2 not found: ${file2Name}. Available files: ${processedFiles.map(f => f.originalName).join(', ')}`
      }
      
      // Fetch both files
      const [file1Response, file2Response] = await Promise.all([
        fetch(file1Info.url),
        fetch(file2Info.url)
      ])
      
      if (!file1Response.ok) {
        return `Failed to fetch file 1: ${file1Response.status}`
      }
      
      if (!file2Response.ok) {
        return `Failed to fetch file 2: ${file2Response.status}`
      }
      
      // Convert to buffers and extract content
      const file1Buffer = Buffer.from(await file1Response.arrayBuffer())
      const file2Buffer = Buffer.from(await file2Response.arrayBuffer())
      
      const file1Content = await extractFileContent(file1Buffer, file1Info.originalName, logger)
      const file2Content = await extractFileContent(file2Buffer, file2Info.originalName, logger)
      
      // Merge content based on strategy
      let mergedContent = ''
      
      switch (mergeStrategy.toLowerCase()) {
        case 'append':
          mergedContent = `${file1Content}\n\n${file2Content}`
          break
        case 'prepend':
          mergedContent = `${file2Content}\n\n${file1Content}`
          break
        case 'interleave':
          const lines1 = file1Content.split('\n')
          const lines2 = file2Content.split('\n')
          const maxLines = Math.max(lines1.length, lines2.length)
          const interleavedLines = []
          
          for (let i = 0; i < maxLines; i++) {
            if (i < lines1.length) interleavedLines.push(lines1[i])
            if (i < lines2.length) interleavedLines.push(lines2[i])
          }
          
          mergedContent = interleavedLines.join('\n')
          break
        default:
          mergedContent = `${file1Content}\n\n${file2Content}`
      }
      
      logger.log(`Files merged successfully: ${file1Name} + ${file2Name}`)
      return mergedContent
      
    } catch (error) {
      logger.log(`Merge files error: ${error}`)
      return `Error merging files: ${error}`
    }
  },

  // Extract content with formatting and create formatted documents
  extractFormattedContent: async (fileName: string, outputFormat: string = 'docx') => {
    try {
      logger.log(`Extracting formatted content from: ${fileName} to ${outputFormat}`)
      
      const fileInfo = processedFiles.find(f => 
        f.originalName === fileName || 
        f.fileName === fileName ||
        f.originalName.toLowerCase().includes(fileName.toLowerCase())
      )
      
      if (!fileInfo) {
        return `File not found: ${fileName}. Available files: ${processedFiles.map(f => f.originalName).join(', ')}`
      }
      
      // Fetch file
      const fileResponse = await fetch(fileInfo.url)
      
      if (!fileResponse.ok) {
        return `Failed to fetch file: ${fileResponse.status}`
      }
      
      const fileBuffer = Buffer.from(await fileResponse.arrayBuffer())
      const fileExtension = fileInfo.originalName.split('.').pop()?.toLowerCase()
      
      // Extract content with formatting
      let formattedContent = ''
      
      if (fileExtension === 'docx' || fileExtension === 'doc') {
        // Extract with formatting for Word documents
        const result = await mammoth.extractRawText({ buffer: fileBuffer })
        formattedContent = result.value
        
        // Add formatting markers for better structure
        const messages = result.messages || []
        if (messages.length > 0) {
          logger.log(`Word document formatting preserved: ${messages.length} formatting elements`)
        }
      } else if (fileExtension === 'pdf') {
        // Extract PDF content with structure
        const blob = new Blob([fileBuffer], { type: 'application/pdf' })
        const loader = new PDFLoader(blob)
        const docs = await loader.load()
        
        // Preserve page structure
        formattedContent = docs.map((doc, index) => {
          return `=== PAGE ${index + 1} ===\n${doc.pageContent}\n`
        }).join('\n')
      } else {
        // For other file types, extract as before
        formattedContent = await extractFileContent(fileBuffer, fileInfo.originalName, logger)
      }
      
      // Create formatted output based on requested format
      let outputContent = ''
      
      switch (outputFormat.toLowerCase()) {
        case 'docx':
          // Create a structured document format
          outputContent = `DOCUMENT: ${fileInfo.originalName}
CREATED: ${new Date().toISOString()}
FORMAT: DOCX (Structured)

${formattedContent}

--- END OF DOCUMENT ---`
          break
        case 'txt':
          outputContent = formattedContent
          break
        case 'html':
          // Convert to HTML format
          outputContent = `<!DOCTYPE html>
<html>
<head>
    <title>${fileInfo.originalName}</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>${fileInfo.originalName}</h1>
    <div class="content">
        ${formattedContent.replace(/\n/g, '<br>')}
    </div>
</body>
</html>`
          break
        default:
          outputContent = formattedContent
      }
      
      logger.log(`Formatted content extracted successfully: ${fileName} -> ${outputFormat}`)
      return outputContent
      
    } catch (error) {
      logger.log(`Extract formatted content error: ${error}`)
      return `Error extracting formatted content: ${error}`
    }
  },

  // Create merged document with formatting
  createMergedDocument: async (file1Name: string, file2Name: string, outputFileName: string, outputFormat: string = 'docx') => {
    try {
      logger.log(`Creating merged document: ${file1Name} + ${file2Name} -> ${outputFileName}.${outputFormat}`)
      
      const file1Info = processedFiles.find(f => 
        f.originalName === file1Name || 
        f.fileName === file1Name ||
        f.originalName.toLowerCase().includes(file1Name.toLowerCase())
      )
      const file2Info = processedFiles.find(f => 
        f.originalName === file2Name || 
        f.fileName === file2Name ||
        f.originalName.toLowerCase().includes(file2Name.toLowerCase())
      )
      
      if (!file1Info) {
        return `File 1 not found: ${file1Name}. Available files: ${processedFiles.map(f => f.originalName).join(', ')}`
      }
      
      if (!file2Info) {
        return `File 2 not found: ${file2Name}. Available files: ${processedFiles.map(f => f.originalName).join(', ')}`
      }
      
      // Fetch both files
      const [file1Response, file2Response] = await Promise.all([
        fetch(file1Info.url),
        fetch(file2Info.url)
      ])
      
      if (!file1Response.ok || !file2Response.ok) {
        return `Failed to fetch files: ${file1Response.status}, ${file2Response.status}`
      }
      
      const file1Buffer = Buffer.from(await file1Response.arrayBuffer())
      const file2Buffer = Buffer.from(await file2Response.arrayBuffer())
      
      // Extract content with formatting
      const file1Content = await extractFileContent(file1Buffer, file1Info.originalName, logger)
      const file2Content = await extractFileContent(file2Buffer, file2Info.originalName, logger)
      
      // Create merged document with proper formatting
      let mergedDocument = ''
      
      switch (outputFormat.toLowerCase()) {
        case 'docx':
          mergedDocument = `MERGED DOCUMENT: ${outputFileName}
CREATED: ${new Date().toISOString()}
SOURCE FILES: ${file1Info.originalName}, ${file2Info.originalName}
FORMAT: DOCX (Structured)

=== DOCUMENT 1: ${file1Info.originalName} ===
${file1Content}

=== DOCUMENT 2: ${file2Info.originalName} ===
${file2Content}

--- END OF MERGED DOCUMENT ---`
          break
        case 'txt':
          mergedDocument = `${file1Content}\n\n${file2Content}`
          break
        case 'html':
          mergedDocument = `<!DOCTYPE html>
<html>
<head>
    <title>${outputFileName}</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>${outputFileName}</h1>
    
    <h2>Document 1: ${file1Info.originalName}</h2>
    <div class="content">
        ${file1Content.replace(/\n/g, '<br>')}
    </div>
    
    <h2>Document 2: ${file2Info.originalName}</h2>
    <div class="content">
        ${file2Content.replace(/\n/g, '<br>')}
    </div>
</body>
</html>`
          break
        default:
          mergedDocument = `${file1Content}\n\n${file2Content}`
      }
      
      logger.log(`Merged document created successfully: ${outputFileName}.${outputFormat}`)
      return mergedDocument
      
    } catch (error) {
      logger.log(`Create merged document error: ${error}`)
      return `Error creating merged document: ${error}`
    }
  }
})

// Plan tools using Grok
async function planTools(
  userPrompt: string,
  processedFiles: ProcessedFileInfo[],
  grok: ChatXAI,
  logger: ProcessingLogger
): Promise<{ tools: string[]; reasoning: string; executionOrder: string[] }> {
  try {
    logger.log(`Planning tools for user prompt`)
    
    const availableTools = [
      'getAllFiles',
      'getFile',
      'edit',
      'analyze',
      'extract',
      'getFilesInfo',
      'mergeFiles',
      'extractFormattedContent',
      'createMergedDocument'
    ]
    
    const systemPrompt = `You are a tool planning assistant. Based on the user's request, determine which tools are needed and in what order they should be executed.

Available tools:
1. getAllFiles() - Get all processed files content
2. getFile(fileName) - Get a specific file by name
3. edit(text, instruction) - Edit or modify text based on instructions
4. analyze(content, type) - Analyze content for specific patterns (structure, entities, sentiment, keywords, summary, legal, dates)
5. extract(content, type) - Extract specific information from content (dates, emails, phones, urls, numbers, quotes, lists, headings)
6. getFilesInfo() - Get information about all processed files
7. mergeFiles(file1Name, file2Name, mergeStrategy) - Merge two files. Strategies: append, prepend, interleave
8. extractFormattedContent(fileName, outputFormat) - Extract content with formatting. Formats: docx, txt, html
9. createMergedDocument(file1Name, file2Name, outputFileName, outputFormat) - Create merged document with formatting. Formats: docx, txt, html

Available files: ${processedFiles.map(f => f.originalName).join(', ')}

User request: ${userPrompt}

Respond with a JSON object in this format:
{
  "tools": ["tool1", "tool2", "tool3"],
  "reasoning": "Explanation of why these tools are needed",
  "executionOrder": ["tool1", "tool2", "tool3"]
}

Only include tools that are actually needed for the user's request.`

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`Plan the tools needed for: ${userPrompt}`)
    ]

    const response = await grok.invoke(messages)
    const content = response.content as string
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    
    const plan = JSON.parse(jsonMatch[0])
    
    logger.log(`Tool planning completed`, plan)
    return plan
    
  } catch (error) {
    logger.log(`Tool planning error: ${error}`)
    // Fallback to basic tools
    return {
      tools: ['getAllFiles', 'analyze'],
      reasoning: 'Fallback plan due to planning error',
      executionOrder: ['getAllFiles', 'analyze']
    }
  }
}

// Execute tools step by step
async function executeTools(
  tools: string[],
  executionOrder: string[],
  processedFiles: ProcessedFileInfo[],
  grok: ChatXAI,
  logger: ProcessingLogger
): Promise<{ steps: AgentStep[]; tokenUsage: { totalTokens: number; promptTokens: number; completionTokens: number; calls: number } }> {
  const steps: AgentStep[] = []
  let totalPromptTokens = 0
  let totalCompletionTokens = 0
  let totalTokens = 0
  let callCount = 0
  
  const toolFunctions = createTools(logger, processedFiles)
  
  logger.log(`Executing tools in order: ${executionOrder.join(', ')}`)
  
  for (const toolName of executionOrder) {
    try {
      if (!toolFunctions[toolName as keyof typeof toolFunctions]) {
        logger.log(`Unknown tool: ${toolName}`)
        continue
      }
      
      callCount++
      logger.log(`Executing tool ${callCount}: ${toolName}`)
      
      // For now, execute tools with basic parameters
      // In a real implementation, you might want Grok to determine the parameters
      let toolResult = ''
      
      switch (toolName) {
        case 'getAllFiles':
          toolResult = await toolFunctions.getAllFiles()
          break
        case 'getFilesInfo':
          toolResult = await toolFunctions.getFilesInfo()
          break
        case 'analyze':
          // Use Grok to determine what to analyze
          const analyzePrompt = `Based on the available files: ${processedFiles.map(f => f.originalName).join(', ')}, what type of analysis would be most useful for the user's request? Respond with just the analysis type (structure, entities, sentiment, keywords, summary, legal, dates).`
          const analyzeResponse = await grok.invoke([new HumanMessage(analyzePrompt)])
          const analysisType = (analyzeResponse.content as string).trim()
          toolResult = await toolFunctions.analyze('Content from all files', analysisType)
          break
        case 'extractFormattedContent':
          // Use Grok to determine which file and format
          const extractPrompt = `Based on the available files: ${processedFiles.map(f => f.originalName).join(', ')}, which file should be extracted and in what format (docx, txt, html)? Respond with just "filename,format".`
          const extractResponse = await grok.invoke([new HumanMessage(extractPrompt)])
          const [fileName, format] = (extractResponse.content as string).trim().split(',')
          toolResult = await toolFunctions.extractFormattedContent(fileName, format || 'docx')
          break
        case 'createMergedDocument':
          // Use Grok to determine which files to merge and output format
          const mergePrompt = `Based on the available files: ${processedFiles.map(f => f.originalName).join(', ')}, which two files should be merged and in what format (docx, txt, html)? Respond with just "file1,file2,outputname,format".`
          const mergeResponse = await grok.invoke([new HumanMessage(mergePrompt)])
          const [file1, file2, outputName, outputFormat] = (mergeResponse.content as string).trim().split(',')
          toolResult = await toolFunctions.createMergedDocument(file1, file2, outputName || 'merged_document', outputFormat || 'docx')
          break
        case 'mergeFiles':
          // Use Grok to determine which files to merge
          const mergeFilesPrompt = `Based on the available files: ${processedFiles.map(f => f.originalName).join(', ')}, which two files should be merged and what strategy (append, prepend, interleave)? Respond with just "file1,file2,strategy".`
          const mergeFilesResponse = await grok.invoke([new HumanMessage(mergeFilesPrompt)])
          const [mergeFile1, mergeFile2, strategy] = (mergeFilesResponse.content as string).trim().split(',')
          toolResult = await toolFunctions.mergeFiles(mergeFile1, mergeFile2, strategy || 'append')
          break
        default:
          toolResult = `Tool ${toolName} executed with placeholder result`
      }
      
      steps.push({
        step: callCount,
        phase: 'execution',
        tool: toolName,
        args: [],
        result: toolResult,
        timestamp: new Date().toISOString()
      })
      
      logger.log(`Tool ${toolName} executed successfully`)
      
    } catch (error) {
      logger.log(`Error executing tool ${toolName}: ${error}`)
      steps.push({
        step: callCount,
        phase: 'execution',
        tool: toolName,
        args: [],
        result: `Error: ${error}`,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  return {
    steps,
    tokenUsage: {
      totalTokens,
      promptTokens: totalPromptTokens,
      completionTokens: totalCompletionTokens,
      calls: callCount
    }
  }
}

// Generate final response
async function generateFinalResponse(
  userPrompt: string,
  processedFiles: ProcessedFileInfo[],
  executionSteps: AgentStep[],
  grok: ChatXAI,
  logger: ProcessingLogger
): Promise<{ result: string; tokenUsage: { totalTokens: number; promptTokens: number; completionTokens: number } }> {
  try {
    logger.log(`Generating final response`)
    
    // Get the last successful tool execution result
    const lastSuccessfulStep = executionSteps
      .filter(step => step.result && step.result.trim() !== '')
      .pop()
    
    if (!lastSuccessfulStep) {
      logger.log(`No successful tool execution found`)
      return {
        result: 'No results available from tool execution.',
        tokenUsage: { totalTokens: 0, promptTokens: 0, completionTokens: 0 }
      }
    }
    
    // Return only the raw result from the last tool execution
    const result = lastSuccessfulStep.result.trim()
    
    // Track minimal token usage since we're not making additional API calls
    const tokenUsage = {
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0
    }
    
    logger.log(`Final response generated from tool execution result`)
    return { result, tokenUsage }
    
  } catch (error) {
    logger.log(`Error generating final response: ${error}`)
    return {
      result: `Error generating final response: ${error}`,
      tokenUsage: { totalTokens: 0, promptTokens: 0, completionTokens: 0 }
    }
  }
}

// Generate text file from processing results
async function generateTextFile(
  fileName: string,
  userPrompt: string,
  agentSteps: AgentStep[],
  finalResult: string,
  logs: string[],
  tokenUsage?: TokenUsage,
  toolExecutionPlan?: ToolExecutionPlan
): Promise<string> {
  const timestamp = new Date().toISOString()
  
  const fileContent = `Generated Report
Generated: ${timestamp}
User Request: ${userPrompt}

=== RESULT ===

${finalResult}

=== END OF REPORT ===
`

  return fileContent
}

export async function POST(request: NextRequest): Promise<NextResponse<GrokProcessingResponse>> {
  const logger = new ProcessingLogger()
  const requestId = `grok-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    logger.log(`[${requestId}] Grok processing request received`)
    
    const body: GrokProcessingRequest = await request.json()
    const { userPrompt, searchQuery } = body

    logger.log(`[${requestId}] Request parameters`, { userPrompt: userPrompt?.substring(0, 100), searchQuery })

    if (!userPrompt) {
      logger.log(`[${requestId}] Missing required parameters`)
      return NextResponse.json({
        success: false,
        error: 'User prompt is required',
        logs: logger.getLogs()
      }, { status: 400 })
    }

    // Initialize Grok
    logger.log(`[${requestId}] Initializing Grok AI model`)
    const grok = new ChatXAI({
      apiKey: process.env.GROK_API_KEY,
      model: 'grok-4',
      maxTokens: 4000,
      temperature: 0.3
    })

    // Fetch relevant files from vector database
    logger.log(`[${requestId}] Fetching relevant files from vector database`)
    const processedFiles = await fetchRelevantFiles(userPrompt, searchQuery || userPrompt, logger)
    
    if (processedFiles.length === 0) {
      logger.log(`[${requestId}] No relevant files found`)
      return NextResponse.json({
        success: false,
        error: 'No relevant files found in vector database',
        logs: logger.getLogs()
      }, { status: 404 })
    }

    logger.log(`[${requestId}] Found ${processedFiles.length} relevant files`)

    // Plan tools using Grok
    logger.log(`[${requestId}] Planning tools`)
    const toolPlan = await planTools(userPrompt, processedFiles, grok, logger)
    
    // Track planning token usage
    const planningTokenUsage = {
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0
    }

    // Execute tools step by step
    logger.log(`[${requestId}] Executing tools`)
    const { steps: executionSteps, tokenUsage: executionTokenUsage } = await executeTools(
      toolPlan.tools,
      toolPlan.executionOrder,
      processedFiles,
      grok,
      logger
    )

    // Generate final response
    logger.log(`[${requestId}] Generating final response`)
    const { result: finalResult, tokenUsage: finalTokenUsage } = await generateFinalResponse(
      userPrompt,
      processedFiles,
      executionSteps,
      grok,
      logger
    )

    // Calculate total token usage
    const totalTokenUsage: TokenUsage = {
      totalTokens: planningTokenUsage.totalTokens + executionTokenUsage.totalTokens + finalTokenUsage.totalTokens,
      promptTokens: planningTokenUsage.promptTokens + executionTokenUsage.promptTokens + finalTokenUsage.promptTokens,
      completionTokens: planningTokenUsage.completionTokens + executionTokenUsage.completionTokens + finalTokenUsage.completionTokens,
      totalCost: calculateTokenCost(
        planningTokenUsage.promptTokens + executionTokenUsage.promptTokens + finalTokenUsage.promptTokens,
        planningTokenUsage.completionTokens + executionTokenUsage.completionTokens + finalTokenUsage.completionTokens
      ),
      breakdown: {
        toolPlanning: planningTokenUsage,
        toolExecution: executionTokenUsage,
        finalResponse: finalTokenUsage
      }
    }

    logger.log(`[${requestId}] Total token usage: ${totalTokenUsage.totalTokens} tokens - Estimated cost: $${totalTokenUsage.totalCost?.toFixed(4) || '0.0000'}`)

    // Generate text file
    logger.log(`[${requestId}] Generating text file report`)
    const generatedFileContent = await generateTextFile(
      processedFiles[0]?.originalName || 'unknown',
      userPrompt,
      executionSteps,
      finalResult,
      logger.getLogs(),
      totalTokenUsage,
      toolPlan
    )

    logger.log(`[${requestId}] Processing completed successfully`)

    return NextResponse.json({
      success: true,
      result: finalResult,
      agentSteps: executionSteps,
      generatedFile: generatedFileContent,
      fileName: `grok_processing_report_${Date.now()}.txt`,
      logs: logger.getLogs(),
      tokenUsage: totalTokenUsage,
      processedFiles: processedFiles,
      toolExecutionPlan: toolPlan
    })

  } catch (error) {
    logger.log(`[${requestId}] Grok processing error: ${error}`)
    console.error('Grok processing error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during Grok processing',
      logs: logger.getLogs()
    }, { status: 500 })
  } finally {
    logger.log(`[${requestId}] Request completed`)
  }
}
