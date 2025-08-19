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
  analyze: async (content: string,userPrompt:string) => {
    try {
      logger.log(`Analyzing content`)
      
      // Simple MVP approach - just pass content to LLM
      const prompt = `Please analyze the following content and provide insights based on the user's request:

Content:
${content}

User Request:
${userPrompt}

Please provide a analysis based on the user's request.`

    return prompt;
      
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
4. analyze(content) - Analyze content and provide insights
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
  grok3: ChatXAI,
  logger: ProcessingLogger,
  userPrompt: string
): Promise<{ steps: AgentStep[]; tokenUsage: { totalTokens: number; promptTokens: number; completionTokens: number; calls: number } }> {
  const steps: AgentStep[] = []
  const totalPromptTokens = 0
  const totalCompletionTokens = 0
  const totalTokens = 0
  let callCount = 0
  
  const toolFunctions = createTools(logger, processedFiles)
  
  logger.log(`Executing tools in order: ${executionOrder.join(', ')}`)
  
  for (const toolName of executionOrder) {
    // Extract the base tool name without parameters
    const baseToolName = toolName.split('(')[0].trim()
    
    try {
      if (!toolFunctions[baseToolName as keyof typeof toolFunctions]) {
        logger.log(`Unknown tool: ${toolName}`)
        continue
      }
      
      callCount++
      logger.log(`Executing tool ${callCount}: ${toolName}`)
      
      // For now, execute tools with basic parameters
      // In a real implementation, you might want Grok to determine the parameters
      let toolResult = ''
      
      switch (baseToolName) {
        case 'getAllFiles':
          toolResult = await toolFunctions.getAllFiles()
          break
        case 'getFile':
          // Use Grok to determine which file to get
          const getFilePrompt = `Based on the available files: ${processedFiles.map(f => f.originalName).join(', ')}, which file should be retrieved? 

IMPORTANT: Respond with a JSON object in this exact format:
{
  "filename": "filename_to_retrieve"
}

Only respond with the JSON object, no additional text.`
          const getFileResponse = await grok.invoke([new HumanMessage(getFilePrompt)])
          const getFileResponseText = (getFileResponse.content as string).trim()
          logger.log(`Get file response: ${getFileResponseText}`)
          
          try {
            // Try to extract JSON from the response
            const jsonMatch = getFileResponseText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const getFileParams = JSON.parse(jsonMatch[0])
              const { filename } = getFileParams
              
              if (filename) {
                logger.log(`Parsed get file parameter: filename=${filename}`)
                toolResult = await toolFunctions.getFile(filename.trim())
              } else {
                logger.log(`Missing filename in JSON response`)
                toolResult = `Error: Missing filename parameter in response: ${getFileResponseText}`
              }
            } else {
              // Fallback: use the response as filename directly
              const getFileName = getFileResponseText.trim()
              if (getFileName) {
                logger.log(`Fallback using response as filename: ${getFileName}`)
                toolResult = await toolFunctions.getFile(getFileName)
              } else {
                logger.log(`Empty response for get file`)
                toolResult = `Error: Empty response for file selection: ${getFileResponseText}`
              }
            }
          } catch (parseError) {
            logger.log(`JSON parsing error: ${parseError}`)
            // Fallback: use the response as filename directly
            const getFileName = getFileResponseText.trim()
            if (getFileName) {
              logger.log(`Fallback using response as filename after parse error: ${getFileName}`)
              toolResult = await toolFunctions.getFile(getFileName)
            } else {
              toolResult = `Error: Failed to parse JSON response: ${getFileResponseText}`
            }
          }
          break
        case 'edit':
          // Use Grok to determine what to edit and how
          const editPrompt = `Based on the available files: ${processedFiles.map(f => f.originalName).join(', ')}, what text should be edited and what instruction should be used? 

IMPORTANT: Respond with a JSON object in this exact format:
{
  "text": "text_to_edit",
  "instruction": "edit_instruction"
}

Only respond with the JSON object, no additional text.`
          const editResponse = await grok.invoke([new HumanMessage(editPrompt)])
          const editResponseText = (editResponse.content as string).trim()
          logger.log(`Edit response: ${editResponseText}`)
          
          try {
            // Try to extract JSON from the response
            const jsonMatch = editResponseText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const editParams = JSON.parse(jsonMatch[0])
              const { text, instruction } = editParams
              
              if (text && instruction) {
                logger.log(`Parsed edit parameters: text=${text.substring(0, 50)}..., instruction=${instruction}`)
                toolResult = await toolFunctions.edit(text.trim(), instruction.trim())
              } else {
                logger.log(`Missing required parameters in JSON response`)
                toolResult = `Error: Missing required parameters (text, instruction) in response: ${editResponseText}`
              }
            } else {
              // Fallback: try comma-separated format
              const parts = editResponseText.split(',').map(p => p.trim()).filter(p => p)
              if (parts.length >= 2) {
                const [text, instruction] = parts
                logger.log(`Fallback parsed edit parameters: text=${text.substring(0, 50)}..., instruction=${instruction}`)
                toolResult = await toolFunctions.edit(text, instruction)
              } else {
                logger.log(`Failed to parse edit response: ${editResponseText}`)
                toolResult = `Error: Could not parse edit parameters from response: ${editResponseText}`
              }
            }
          } catch (parseError) {
            logger.log(`JSON parsing error: ${parseError}`)
            toolResult = `Error: Failed to parse JSON response: ${editResponseText}`
          }
          break
        case 'analyze':
          // Get content from all files for analysis
          const allContentPromises = processedFiles.map(async (f) => {
            try {
              const fileResponse = await fetch(f.url)
              if (!fileResponse.ok) return `[Error fetching ${f.originalName}]`
              const fileBuffer = Buffer.from(await fileResponse.arrayBuffer())
              return await extractFileContent(fileBuffer, f.originalName, logger)
            } catch (error) {
              return `[Error processing ${f.originalName}: ${error}]`
            }
          })
          
          const allContent = (await Promise.all(allContentPromises)).join('\n\n---\n\n')
          const humanPromt = await toolFunctions.analyze(allContent,userPrompt)
          const humanResponse = await grok.invoke([new HumanMessage(humanPromt)])
          toolResult = humanResponse.content as string
          break
        case 'extract':
          // Use Grok to determine what to extract and from what content
          const extractContentPrompt = `Based on the available files: ${processedFiles.map(f => f.originalName).join(', ')}, what type of extraction would be most useful (dates, emails, phones, urls, numbers, quotes, lists, headings)? 

IMPORTANT: Respond with a JSON object in this exact format:
{
  "extractionType": "dates"
}

Only respond with the JSON object, no additional text.`
          const extractContentResponse = await grok.invoke([new HumanMessage(extractContentPrompt)])
          const extractContentResponseText = (extractContentResponse.content as string).trim()
          logger.log(`Extract content response: ${extractContentResponseText}`)
          
          try {
            // Try to extract JSON from the response
            const jsonMatch = extractContentResponseText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const extractContentParams = JSON.parse(jsonMatch[0])
              const { extractionType } = extractContentParams
              
              if (extractionType) {
                logger.log(`Parsed extract content parameter: extractionType=${extractionType}`)
                toolResult = await toolFunctions.extract('Content from all files', extractionType.trim())
              } else {
                logger.log(`Missing extractionType in JSON response`)
                toolResult = `Error: Missing extractionType parameter in response: ${extractContentResponseText}`
              }
            } else {
              // Fallback: use the response as extraction type directly
              const extractionType = extractContentResponseText.trim()
              if (extractionType) {
                logger.log(`Fallback using response as extraction type: ${extractionType}`)
                toolResult = await toolFunctions.extract('Content from all files', extractionType)
              } else {
                logger.log(`Empty response for extract content`)
                toolResult = `Error: Empty response for extraction type selection: ${extractContentResponseText}`
              }
            }
          } catch (parseError) {
            logger.log(`JSON parsing error: ${parseError}`)
            // Fallback: use the response as extraction type directly
            const extractionType = extractContentResponseText.trim()
            if (extractionType) {
              logger.log(`Fallback using response as extraction type after parse error: ${extractionType}`)
              toolResult = await toolFunctions.extract('Content from all files', extractionType)
            } else {
              toolResult = `Error: Failed to parse JSON response: ${extractContentResponseText}`
            }
          }
          break
        case 'getFilesInfo':
          toolResult = await toolFunctions.getFilesInfo()
          break
        case 'extractFormattedContent':
          // Use Grok to determine which file and format
          const extractFormatPrompt = `Based on the available files: ${processedFiles.map(f => f.originalName).join(', ')}, which file should be extracted and in what format (docx, txt, html)? 

IMPORTANT: Respond with a JSON object in this exact format:
{
  "filename": "filename_to_extract",
  "format": "docx"
}

Only respond with the JSON object, no additional text.`
          const extractFormatResponse = await grok.invoke([new HumanMessage(extractFormatPrompt)])
          const extractFormatResponseText = (extractFormatResponse.content as string).trim()
          logger.log(`Extract format response: ${extractFormatResponseText}`)
          
          try {
            // Try to extract JSON from the response
            const jsonMatch = extractFormatResponseText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const extractParams = JSON.parse(jsonMatch[0])
              const { filename, format } = extractParams
              
              if (filename) {
                logger.log(`Parsed extract parameters: filename=${filename}, format=${format}`)
                toolResult = await toolFunctions.extractFormattedContent(filename.trim(), format?.trim() || 'docx')
              } else {
                logger.log(`Missing filename in JSON response`)
                toolResult = `Error: Missing filename parameter in response: ${extractFormatResponseText}`
              }
            } else {
              // Fallback: try comma-separated format
              const parts = extractFormatResponseText.split(',').map(p => p.trim()).filter(p => p)
              if (parts.length >= 2) {
                const [formatFileName, format] = parts
                logger.log(`Fallback parsed extract parameters: filename=${formatFileName}, format=${format}`)
                toolResult = await toolFunctions.extractFormattedContent(formatFileName, format || 'docx')
              } else {
                logger.log(`Failed to parse extract format response: ${extractFormatResponseText}`)
                toolResult = `Error: Could not parse extract parameters from response: ${extractFormatResponseText}`
              }
            }
          } catch (parseError) {
            logger.log(`JSON parsing error: ${parseError}`)
            toolResult = `Error: Failed to parse JSON response: ${extractFormatResponseText}`
          }
          break
        case 'createMergedDocument':
          // Use Grok to determine which files to merge and output format
          const mergePrompt = `Based on the available files: ${Array.from(new Set(...processedFiles.map(f => f.originalName))).join(', ')}, which two files should be combined into a NEW DOCUMENT and in what format (docx, txt, html)? 

This should create a completely new document by merging content from two existing files.

IMPORTANT: Respond with a JSON object in this exact format:
{
  "file1": "filename1",
  "file2": "filename2", 
  "outputName": "merged_document_name",
  "format": "docx"
}

Only respond with the JSON object, no additional text.`
          const mergeResponse = await grok3.invoke([new HumanMessage(mergePrompt)])
          
          // Parse the JSON response
          const mergeResponseText = (mergeResponse.content as string).trim()
          logger.log(`Merge response: ${mergeResponseText}`)
          
          try {
            // Try to extract JSON from the response
            const jsonMatch = mergeResponseText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const mergeParams = JSON.parse(jsonMatch[0])
              const { file1, file2, outputName, format } = mergeParams
              
              if (file1 && file2) {
                logger.log(`Parsed merge parameters: file1=${file1}, file2=${file2}, outputName=${outputName}, format=${format}`)
                toolResult = await toolFunctions.createMergedDocument(
                  file1.trim(), 
                  file2.trim(), 
                  outputName?.trim() || 'merged_document', 
                  format?.trim() || 'docx'
                )
              } else {
                logger.log(`Missing required parameters in JSON response`)
                toolResult = `Error: Missing required parameters (file1, file2) in response: ${mergeResponseText}`
              }
            } else {
              // Fallback: try comma-separated format
              const parts = mergeResponseText.split(',').map(p => p.trim()).filter(p => p)
              if (parts.length >= 4) {
                const [file1, file2, outputName, outputFormat] = parts
                logger.log(`Fallback parsed merge parameters: file1=${file1}, file2=${file2}, outputName=${outputName}, format=${outputFormat}`)
                toolResult = await toolFunctions.createMergedDocument(file1, file2, outputName || 'merged_document', outputFormat || 'docx')
              } else {
                logger.log(`Failed to parse merge response: ${mergeResponseText}`)
                toolResult = `Error: Could not parse merge parameters from response: ${mergeResponseText}`
              }
            }
          } catch (parseError) {
            logger.log(`JSON parsing error: ${parseError}`)
            toolResult = `Error: Failed to parse JSON response: ${mergeResponseText}`
          }
          break
        case 'mergeFiles':
          // Use Grok to determine which files to merge
          const mergeFilesPrompt = `Based on the available files: ${processedFiles.map(f => f.originalName).join(', ')}, which two files should be COMBINED using a specific strategy (append, prepend, interleave)? 

This should combine the content of two files using the specified strategy to modify one of the existing files.

IMPORTANT: Respond with a JSON object in this exact format:
{
  "file1": "filename1",
  "file2": "filename2",
  "strategy": "append"
}

Only respond with the JSON object, no additional text.`
          const mergeFilesResponse = await grok.invoke([new HumanMessage(mergeFilesPrompt)])
          const mergeFilesResponseText = (mergeFilesResponse.content as string).trim()
          logger.log(`Merge files response: ${mergeFilesResponseText}`)
          
          try {
            // Try to extract JSON from the response
            const jsonMatch = mergeFilesResponseText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const mergeFilesParams = JSON.parse(jsonMatch[0])
              const { file1, file2, strategy } = mergeFilesParams
              
              if (file1 && file2) {
                logger.log(`Parsed merge files parameters: file1=${file1}, file2=${file2}, strategy=${strategy}`)
                toolResult = await toolFunctions.mergeFiles(file1.trim(), file2.trim(), strategy?.trim() || 'append')
              } else {
                logger.log(`Missing required parameters in JSON response`)
                toolResult = `Error: Missing required parameters (file1, file2) in response: ${mergeFilesResponseText}`
              }
            } else {
              // Fallback: try comma-separated format
              const parts = mergeFilesResponseText.split(',').map(p => p.trim()).filter(p => p)
              if (parts.length >= 3) {
                const [mergeFile1, mergeFile2, strategy] = parts
                logger.log(`Fallback parsed merge files parameters: file1=${mergeFile1}, file2=${mergeFile2}, strategy=${strategy}`)
                toolResult = await toolFunctions.mergeFiles(mergeFile1, mergeFile2, strategy || 'append')
              } else {
                logger.log(`Failed to parse merge files response: ${mergeFilesResponseText}`)
                toolResult = `Error: Could not parse merge files parameters from response: ${mergeFilesResponseText}`
              }
            }
          } catch (parseError) {
            logger.log(`JSON parsing error: ${parseError}`)
            toolResult = `Error: Failed to parse JSON response: ${mergeFilesResponseText}`
          }
          break
        default:
          toolResult = `Tool ${toolName} executed with placeholder result`
      }
      
      steps.push({
        step: callCount,
        phase: 'execution',
        tool: baseToolName,
        args: [],
        result: toolResult,
        timestamp: new Date().toISOString()
      })
      
      logger.log(`Tool ${baseToolName} executed successfully`)
      
    } catch (error) {
      logger.log(`Error executing tool ${baseToolName}: ${error}`)
      steps.push({
        step: callCount,
        phase: 'execution',
        tool: baseToolName,
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
  
  const fileContent = `${finalResult}`

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

    const grok3 = new ChatXAI({
      apiKey: process.env.GROK_API_KEY,
      model: 'grok-3',
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
      grok3,
      logger,
      userPrompt
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
