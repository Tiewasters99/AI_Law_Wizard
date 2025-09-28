import { NextRequest, NextResponse } from 'next/server'
import { ChatXAI } from '@langchain/xai'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { searchRelevant } from '../../lib/retrival'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import mammoth from 'mammoth'
import { prisma } from '../../../lib/prisma'
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { searchChunksBySummary, getChunksWithSummaries } from '../../lib/summaryService'
import { openapi, pineIndex } from '../../lib/pineConfig'

interface ProcessingRequest {
  userPrompt: string
  searchQuery?: string
}

interface ProcessingResponse {
  success: boolean
  result?: string
  error?: string
  processedFiles?: ProcessedFileInfo[]
  confidence?: number
  operationChain?: OperationStep[]
  totalSteps?: number
  completedSteps?: number
  queryId?: string // ID of saved query in database
  responseMode?: 'question_answering' | 'action_performance'
  editedFiles?: EditedFileInfo[]
}

interface EditedFileInfo {
  fileId: string
  fileName: string
  originalContent: string
  editedContent: string
  changes: string[]
}

interface ProcessedFileInfo {
  fileId: string
  fileName: string
  originalName: string
  fileSize: number
  downloadUrl?: string
  fileType?: string
  jobId?: string
  totalChunks?: number
  processedChunks?: number
  isOneDriveFile?: boolean
  oneDriveId?: string | null
}

interface OperationStep {
  operation: 'summary' | 'analysis' | 'qa' | 'action_performance'
  confidence?: number
}

// Vector-first search approach: search vector database first, then fetch summaries
const searchVectorDatabaseFirst = async (
  query: string,
  limit: number
): Promise<Array<{
  id: string;
  content: string;
  summary: string;
  metadata: any;
  chunkIndex: number;
  relevanceScore: number;
  jobId: string;
  jobFileName: string;
}>> => {
  try {
    // Step 1: Search vector database across ALL chunks at once
    const vectorResults = await searchAllChunksInVectorDB(query, limit * 2) // Get more results for better filtering
    
    if (vectorResults.length === 0) {
      return []
    }

    // Step 2: Get database chunks using embeddingId to find jobId and summaries
    const embeddingIds = vectorResults.map(result => result.embeddingId)
    
    const databaseChunks = await prisma.embeddingChunk.findMany({
      where: {
        embeddingId: { in: embeddingIds },
        status: 'COMPLETED'
      },
      select: {
        id: true,
        jobId: true,
        summary: true,
        metadata: true,
        embeddingId: true,
        content: true
      }
    })

    // Step 3: Get job information for the found chunks
    const jobIds = [...new Set(databaseChunks.map(chunk => chunk.jobId))]
    
    const jobs = await prisma.embeddingJob.findMany({
      where: { 
        id: { in: jobIds },
        status: 'COMPLETED' 
      },
      select: { id: true, fileName: true }
    })
    
    const jobMap = new Map(jobs.map(job => [job.id, job.fileName]))

    // Step 4: Create mapping from embeddingId to database chunk
    const chunkMap = new Map(
      databaseChunks.map(chunk => [chunk.embeddingId, chunk])
    )

    // Step 5: Combine vector results with database chunk info and job info
    const enrichedResults = vectorResults
      .map(vectorResult => {
        const databaseChunk = chunkMap.get(vectorResult.embeddingId)
        const jobFileName = databaseChunk ? jobMap.get(databaseChunk.jobId) : null
        
        return {
          id: vectorResult.id,
          content: vectorResult.content,
          summary: databaseChunk?.summary || 'No summary available',
          metadata: databaseChunk?.metadata || vectorResult.metadata || {},
          chunkIndex: vectorResult.chunkIndex,
          relevanceScore: vectorResult.relevanceScore,
          jobId: databaseChunk?.jobId || 'unknown',
          jobFileName: jobFileName || `Document ${databaseChunk?.jobId || 'unknown'}`
        }
      })
      .filter(result => result.jobId !== 'unknown') // Only include chunks with valid jobId
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)

    console.log(`🚀 Vector-first search: Found ${enrichedResults.length} relevant chunks from ${vectorResults.length} vector results`)
    return enrichedResults

  } catch (error) {
    console.error('Error in vector-first search:', error)
    return []
  }
}

// Search all chunks in vector database across all jobs
const searchAllChunksInVectorDB = async (
  query: string,
  limit: number
): Promise<Array<{
  id: string;
  content: string;
  metadata: any;
  chunkIndex: number;
  relevanceScore: number;
  fileId: string;
  embeddingId: string;
}>> => {
  try {
    // Create embedding for the query
    const queryEmbedding = await openapi.embedQuery(query)
    
    // Search across ALL chunks without job filtering
    const searchResults = await pineIndex.query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true,
      includeValues: false
      // No filter - search across all chunks
    })
    
    if (!searchResults.matches || searchResults.matches.length === 0) {
      return []
    }

    // Convert results to our format based on actual ingestion structure
    return searchResults.matches.map((match: any) => ({
      id: match.id, // This is the vector DB ID: `${fileId}__${chunkIndex}`
      content: match.metadata?.text || '', // Content is stored as 'text' in metadata
      metadata: match.metadata || {},
      chunkIndex: match.metadata?.chunkIndex || 0,
      relevanceScore: match.score || 0,
      fileId: match.metadata?.fileId || 'unknown',
      embeddingId: match.id // Vector DB ID matches embeddingId in database
    }))

  } catch (error) {
    console.error('Error searching vector database:', error)
    return []
  }
}

// Quick summary-based search tool for fast retrieval
const quickSummarySearchTool = tool(
  async (input) => {
    const { query, limit = 5 } = input as { query: string; limit?: number }
    try {
      // Vector-first approach: search vector database first, then get summaries
      const allRelevantChunks = await searchVectorDatabaseFirst(query, limit)

      if (allRelevantChunks.length === 0) {
        return { success: false, files: [], error: "No relevant chunks found in summaries" }
      }

      // Sort by relevance score and take the best matches
      const sortedChunks = allRelevantChunks
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit)

      const files = sortedChunks.map((chunk, index) => {
        const fileId = `${chunk.jobId}__${chunk.chunkIndex}`
        const fileName = chunk.jobFileName || `Document ${index + 1}`
        
        return {
          fileId: fileId,
          fileName: fileName,
          originalName: fileName,
          fileSize: chunk.content.length,
          fileType: 'txt',
          url: '',
          downloadUrl: '', // Will be populated if we have access to original file
          summary: chunk.summary,
          metadata: chunk.metadata,
          relevanceScore: chunk.relevanceScore
          // Removed content to avoid large data transfer
        }
      })

      return { success: true, files, error: null }
    } catch (error) {
      console.error('Quick summary search error:', error)
      return { success: false, files: [], error: String(error) }
    }
  },
  {
    name: "quick_summary_search_tool",
    description: "Fast search using document summaries for quick answers",
    schema: z.object({
      query: z.string().describe("Search query to find relevant content using summaries"),
      limit: z.number().optional().describe("Maximum number of files to return")
    })
  }
)

// File processing tool (fallback for detailed search)
const fileProcessingTool = tool(
  async (input) => {
    const { query, limit = 5 } = input as { query: string; limit?: number }
    try {
      const relevantChunks = await searchRelevant(query, limit)
      if (relevantChunks.length === 0) {
        return { success: false, files: [], error: "No relevant files found" }
      }

      const files = relevantChunks.map((chunk, index) => {
        const metadata = (chunk as any).metadata || {}
        const fileId = metadata.fileId || `file-${index}`
        const fileName = fileId.includes('.') ? fileId.split('.')[0] + '.' + fileId.split('.').pop() : `Document ${index + 1}`
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'txt'
        
        return {
          fileId: fileId,
          fileName: fileName,
          originalName: fileName,
          fileSize: metadata.text?.length || 0,
          fileType: fileExtension,
          url: '',
          downloadUrl: '' // Will be populated if we have access to original file
          // Removed content to avoid large data transfer
        }
      })

      return { success: true, files, error: null }
    } catch (error) {
      console.error('File processing error:', error)
      return { success: false, files: [], error: String(error) }
    }
  },
  {
    name: "file_processing_tool",
    description: "Search for relevant files based on a query using vector similarity",
    schema: z.object({
      query: z.string().describe("Search query to find relevant files"),
      limit: z.number().optional().describe("Maximum number of files to return")
    })
  }
)

// Content extraction tool with smart caching
const contentExtractionTool = tool(
  async (input) => {
    const { fileUrl, fileName, content } = input as { fileUrl?: string; fileName: string; content?: string }

    try {
      // If content is already provided, return it
      if (content) {
        return { success: true, content, error: null }
      }

      // If we have a URL, try to fetch and extract content
      if (fileUrl) {
        const response = await fetch(fileUrl)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const buffer = Buffer.from(await response.arrayBuffer())
        const extractedContent = await extractFileContent(buffer, fileName)

        return { success: true, content: extractedContent, error: null }
      }

      throw new Error('No content or file URL provided')
    } catch (error) {
      return { success: false, content: "", error: String(error) }
    }
  },
  {
    name: "content_extraction_tool",
    description: "Extract content from a file",
    schema: z.object({
      fileUrl: z.string().optional().describe("URL of the file to extract content from"),
      fileName: z.string().describe("Name of the file for format detection"),
      content: z.string().optional().describe("Pre-extracted content")
    })
  }
)

// File editing tool for action performance mode
const fileEditingTool = tool(
  async (input) => {
    const { fileId, fileName, originalContent, editInstructions } = input as { 
      fileId: string; 
      fileName: string; 
      originalContent: string; 
      editInstructions: string 
    }

    try {
      // Use cost-effective GPT-4o-mini for file editing
      const gpt4oMini = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o-mini',
        maxTokens: 3000,
        temperature: 0.1
      })

      const editPrompt = `You are a file editor. Edit the following file content based on the user's instructions.

File: ${fileName}
Original Content:
${originalContent}

Edit Instructions: ${editInstructions}

Return the complete edited file content. Make sure to preserve the original structure and formatting where appropriate.`

      const response = await gpt4oMini.invoke([
        new SystemMessage("You are a precise file editor. Return only the edited content without any explanations or markdown formatting."),
        new HumanMessage(editPrompt)
      ])

      const editedContent = response.content as string

      // Generate change summary
      const changes = generateChangeSummary(originalContent, editedContent)

      return { 
        success: true, 
        editedContent, 
        changes,
        error: null 
      }
    } catch (error) {
      return { success: false, editedContent: "", changes: [], error: String(error) }
    }
  },
  {
    name: "file_editing_tool",
    description: "Edit file content based on user instructions",
    schema: z.object({
      fileId: z.string().describe("ID of the file to edit"),
      fileName: z.string().describe("Name of the file being edited"),
      originalContent: z.string().describe("Original content of the file"),
      editInstructions: z.string().describe("Instructions for editing the file")
    })
  }
)

// Fast response mode detection using simple keyword matching + GPT-4o-mini fallback
const responseModeDetectionTool = tool(
  async (input) => {
    const { userPrompt } = input as { userPrompt: string }
    
    try {
      // Refactored detection based on user intent:
      // QUESTION ANSWERING: User wants to GET INFORMATION from existing documents
      //   Examples: "Summarize this document", "What are the key points?", "Analyze this file"
      // ACTION PERFORMANCE: User wants to PERFORM ACTIONS/MANIPULATIONS on documents  
      //   Examples: "Edit this file", "Add content to this document", "Merge these files", "Create a new report"
      
      const questionKeywords = [
        // Information requests - user wants to GET details from existing documents
        'what', 'how', 'why', 'when', 'where', 'who', 'which', 'explain', 'describe',
        'tell me', 'show me', 'give me', 'find', 'search', 'look for', 'identify',
        'define', 'clarify', 'understand', 'learn', 'know', 'discover', 'reveal',
        // Document analysis - getting information from documents
        'summarize', 'summary', 'analyze', 'analysis', 'extract', 'key points', 'main points',
        'overview', 'highlights', 'details', 'content', 'information', 'data',
        'what does it say', 'what is in', 'what contains', 'what includes'
      ]
      
      const actionKeywords = [
        // File manipulation - user wants to PERFORM ACTIONS on documents
        'edit', 'modify', 'change', 'update', 'add', 'remove', 'delete', 'insert',
        'rewrite', 'reformat', 'restructure', 'improve', 'fix', 'correct', 'adjust',
        'create', 'write', 'generate', 'draft', 'compose', 'prepare', 'develop',
        'build', 'construct', 'formulate', 'translate', 'convert', 'transform',
        'adapt', 'revise', 'refine', 'polish', 'enhance', 'optimize', 'streamline',
        'simplify', 'expand', 'condense', 'merge', 'combine', 'split', 'divide',
        'organize', 'categorize', 'classify', 'format', 'style', 'design', 'layout',
        'structure', 'outline', 'plan', 'fill', 'populate', 'update content'
      ]
      
      const lowerPrompt = userPrompt.toLowerCase()
      
      // Pattern matching based on correct understanding:
      // Question Answering: Getting information from documents
      const questionPatterns = [
        // Information requests - user wants to GET details
        /^(what|how|why|when|where|who|which|explain|describe)/i,
        /(what|how|why|when|where|who|which|explain|describe)\s+(is|are|does|do|can|could|would|should)/i,
        /(tell me|show me|give me|find|search|look for|identify|define|clarify)/i,
        // Document analysis - getting information from documents
        /(summarize|summary|analyze|analysis|extract|key points|main points|overview|highlights)/i,
        /(what does it say|what is in|what contains|what includes|what are the)/i,
        /(summarize|analyze|extract|overview|highlights|key points|main points)\s+(the|this|my|a|an)/i,
        /(summarize|analyze|extract|overview|highlights|key points|main points)\s+(letter|document|file|report|paper|article|content)/i,
        /(summarize|analyze|extract|overview|highlights|key points|main points)\s+(relating to|about|regarding|concerning)/i
      ]
      
      // Action Performance: Performing manipulations on documents
      const actionPatterns = [
        // File manipulation - user wants to PERFORM ACTIONS
        /^(edit|modify|change|update|create|write|add|remove|delete|insert|rewrite|reformat|restructure)/i,
        /(edit|modify|change|update|create|write|add|remove|delete|insert|rewrite|reformat|restructure)\s+(the|this|my|a|an)/i,
        /(edit|modify|change|update|create|write|add|remove|delete|insert|rewrite|reformat|restructure)\s+(letter|document|file|report|paper|article|content)/i,
        // Content manipulation
        /(fill|populate|update content|add content|insert content|modify content)/i,
        /(merge|combine|split|divide|organize|categorize|classify|format|style|design|layout)/i,
        // Document creation and manipulation
        /(create|write|generate|draft|compose|prepare|develop|build|construct|formulate)\s+(a|an|the|new|my)/i,
        /(translate|convert|transform|adapt|revise|refine|polish|enhance|optimize|streamline)/i
      ]
      
      // Check for question patterns first (information requests)
      const hasQuestionPatterns = questionPatterns.some(pattern => pattern.test(userPrompt))
      if (hasQuestionPatterns) {
        console.log("❓ Detected question pattern - user wants information from documents")
        return { 
          success: true, 
          mode: 'question_answering',
          error: null 
        }
      }
      
      // Check for action patterns (file manipulation)
      const hasActionPatterns = actionPatterns.some(pattern => pattern.test(userPrompt))
      if (hasActionPatterns) {
        console.log("🎯 Detected action pattern - user wants to perform actions on documents")
        return { 
          success: true, 
          mode: 'action_performance',
          error: null 
        }
      }
      
      // Fallback: Check for keywords with better scoring
      const questionScore = questionKeywords.reduce((score, keyword) => {
        return score + (lowerPrompt.includes(keyword) ? 1 : 0)
      }, 0)
      
      const actionScore = actionKeywords.reduce((score, keyword) => {
        return score + (lowerPrompt.includes(keyword) ? 1 : 0)
      }, 0)
      
      // Prioritize question answering (information requests) over actions
      if (questionScore > 0) {
        console.log(`❓ Keyword detection: question answering (score: ${questionScore}) - user wants information`)
        return { 
          success: true, 
          mode: 'question_answering',
          error: null 
        }
      }
      
      if (actionScore > 0) {
        console.log(`🎯 Keyword detection: action performance (score: ${actionScore}) - user wants to perform actions`)
        return { 
          success: true, 
          mode: 'action_performance',
          error: null 
        }
      }
      
      // Final fallback to GPT-4o-mini for ambiguous cases
      console.log("🤖 Using AI fallback for mode detection")
      const gpt4oMini = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o-mini',
        maxTokens: 10,
        temperature: 0.1
      })

      const response = await gpt4oMini.invoke([
        new SystemMessage("Respond with only 'question' or 'action'. \n\nQUESTION: User wants to GET INFORMATION from documents (summarize, analyze, extract, overview, key points, what is in, what contains, etc.)\nACTION: User wants to PERFORM ACTIONS on documents (edit, modify, create, write, add, remove, merge, fill, populate, etc.)"),
        new HumanMessage(`Classify this request: "${userPrompt}"`)
      ])

      const mode = (response.content as string).toLowerCase().trim()
      console.log(`🤖 AI fallback detected: ${mode}`)
      return { 
        success: true, 
        mode: mode === 'action' ? 'action_performance' : 'question_answering',
        error: null 
      }
    } catch (error) {
      return { success: false, mode: 'question_answering', error: String(error) }
    }
  },
  {
    name: "response_mode_detection_tool",
    description: "Fast detection of question vs action requests",
    schema: z.object({
      userPrompt: z.string().describe("The user's request to analyze")
    })
  }
)

// File content extraction functions
const extractFileContent = async (buffer: Buffer, fileName: string) => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''

  try {
    switch (fileExtension) {
      case 'pdf':
        return await extractPDFContent(buffer)
      case 'doc':
      case 'docx':
        return await extractWordContent(buffer)
      case 'txt':
      case 'json':
      default:
        return buffer.toString('utf-8')
    }
  } catch (error) {
    console.error(`Error extracting content from ${fileName}:`, error)
    throw new Error(`Failed to extract content from ${fileName}`)
  }
}

const extractPDFContent = async (buffer: Buffer) => {
  try {
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
    if (arrayBuffer instanceof SharedArrayBuffer) {
      throw new Error('SharedArrayBuffer is not supported for PDF processing')
    }
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
    const loader = new PDFLoader(blob)
    const docs = await loader.load()
    return docs.map(doc => doc.pageContent).join('\n')
  } catch (error) {
    throw new Error(`PDF parsing error: ${error}`)
  }
}

const extractWordContent = async (buffer: Buffer) => {
  try {
    const { value } = await mammoth.extractRawText({ buffer })
    return value
  } catch (error) {
    throw new Error(`Word document parsing error: ${error}`)
  }
}

// Helper function to generate change summary
const generateChangeSummary = (original: string, edited: string): string[] => {
  const changes: string[] = []
  
  if (original.length !== edited.length) {
    changes.push(`Content length changed from ${original.length} to ${edited.length} characters`)
  }
  
  const originalLines = original.split('\n').length
  const editedLines = edited.split('\n').length
  if (originalLines !== editedLines) {
    changes.push(`Line count changed from ${originalLines} to ${editedLines} lines`)
  }
  
  // Simple word count comparison
  const originalWords = original.split(/\s+/).filter(w => w.length > 0).length
  const editedWords = edited.split(/\s+/).filter(w => w.length > 0).length
  if (originalWords !== editedWords) {
    changes.push(`Word count changed from ${originalWords} to ${editedWords} words`)
  }
  
  return changes
}


// Helper function to detect response mode with timeout protection
const detectResponseMode = async (userPrompt: string): Promise<'question_answering' | 'action_performance'> => {
  console.log("🔍 Detecting response mode")
  const modeDetectionPromise = responseModeDetectionTool.invoke({ userPrompt })
  const modeDetection = await Promise.race([
    modeDetectionPromise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Mode detection timeout')), 5000)
    )
  ]) as any
  
  const responseMode = modeDetection.mode as 'question_answering' | 'action_performance'
  console.log(`📋 Detected mode: ${responseMode}`)
  return responseMode
}

// Helper function to search for relevant files with smart fallback
const searchRelevantFiles = async (query: string): Promise<any> => {
  console.log("🔍 Finding relevant files with smart search")
  
  // First try quick summary-based search for fast retrieval
  try {
    const quickSearchResult = await quickSummarySearchTool.invoke({ 
      query, 
      limit: 5 
    })
    
    if (quickSearchResult.success && quickSearchResult.files && quickSearchResult.files.length > 0) {
      console.log("✅ Quick summary search found relevant content")
      return quickSearchResult
    }
  } catch (error) {
    console.warn("⚠️ Quick summary search failed, falling back to vector search:", error)
  }
  
  // Fallback to vector similarity search
  console.log("🔄 Falling back to vector similarity search")
  const fileSearchResult = await fileProcessingTool.invoke({ 
    query, 
    limit: 5 
  })
  
  if (!fileSearchResult.success || !fileSearchResult.files || fileSearchResult.files.length === 0) {
    throw new Error("No relevant files found for the query")
  }
  
  return fileSearchResult
}

// Helper function to process question answering mode
const processQuestionAnswering = async (
  request: ProcessingRequest, 
  fileSearchResult: any, 
  startTime: number
): Promise<ProcessingResponse> => {
  console.log("❓ Processing as question answering with chunk-based context")
  
  const gpt4oMini = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    maxTokens: 2000,
    temperature: 0.3
  })

  // Use chunk data directly for question answering (no need to fetch full files)
  // Prioritize summaries when available for faster processing
  const chunkContext = fileSearchResult.files
    .map((file: any, index: number) => {
      const summary = file.summary ? `\nSummary: ${file.summary}` : ''
      const metadata = file.metadata ? `\nMetadata: ${JSON.stringify(file.metadata, null, 2)}` : ''
      const relevanceScore = file.relevanceScore ? `\nRelevance Score: ${file.relevanceScore}` : ''
      
      return `Document ${index + 1}: ${file.fileName}${relevanceScore}\nContent: ${file.content || 'No content available'}${summary}${metadata}\n---\n`
    })
    .join('\n')

  const qaPrompt = `Based on the following document chunks, answer the user's question.

Document Chunks:
${chunkContext}

User Question: ${request.userPrompt}

Provide a comprehensive answer based on the available document content. If the answer cannot be found in the provided chunks, say so clearly.`

  const response = await gpt4oMini.invoke([
    new SystemMessage("You are a helpful assistant that answers questions based on document content."),
    new HumanMessage(qaPrompt)
  ])

  // Save question answering response to database
  const processingTime = Date.now() - startTime
  
  // Extract unique job IDs from the search results
  const jobIds = new Set<string>()
  fileSearchResult.files.forEach((file: any) => {
    const jobId = file.jobId || file.fileId.split('__')[0]
    jobIds.add(jobId)
  })

  // Fetch original files from embedding_jobs table
  let processedFiles: ProcessedFileInfo[] = []
  try {
    const originalFiles = await prisma.embeddingJob.findMany({
      where: {
        id: {
          in: Array.from(jobIds)
        },
        status: 'COMPLETED'
      },
      select: {
        id: true,
        fileName: true,
        originalName: true,
        fileType: true,
        fileSize: true,
        filePath: true,
        totalChunks: true,
        processedChunks: true,
        isOneDriveFile: true,
        oneDriveId: true,
        createdAt: true,
        completedAt: true
      }
    })

    processedFiles = originalFiles.map(job => ({
      fileId: job.id,
      fileName: job.fileName,
      originalName: job.originalName,
      fileSize: job.fileSize,
      downloadUrl: job.filePath || '',
      fileType: job.fileType,
      jobId: job.id,
      totalChunks: job.totalChunks,
      processedChunks: job.processedChunks,
      isOneDriveFile: job.isOneDriveFile,
      oneDriveId: job.oneDriveId
    }))

    console.log(`📁 Retrieved ${processedFiles.length} original files from database`)
  } catch (dbError) {
    console.error("❌ Failed to fetch original files from database:", dbError)
    // Fallback to chunk-based files if database fetch fails
    processedFiles = fileSearchResult.files.map((file: any) => ({
      fileId: file.fileId,
      fileName: file.fileName,
      originalName: file.originalName,
      fileSize: file.fileSize,
      downloadUrl: file.downloadUrl || file.url,
      fileType: file.fileType || 'txt'
      // Removed: contentLength, url (not used in frontend)
    }))
  }

  let queryId: string | null = null
  try {
    const savedQuery = await prisma.documentQuery.create({
      data: {
        userQuery: request.userPrompt,
        aiResponse: response.content as string,
        searchQuery: request.searchQuery,
        success: true,
        confidence: 0.9,
        processingTime,
        totalSteps: 2, // file search + question answering
        completedSteps: 2,
        toolsUsed: ['file_processing_tool'],
        filesProcessed: processedFiles.length > 0 ? processedFiles as any : undefined
      }
    })
    queryId = savedQuery.id
    console.log(`💾 Question answering response saved to database with ID: ${queryId}`)
  } catch (dbError) {
    console.error("❌ Failed to save question answering response to database:", dbError)
  }

  return {
    success: true,
    result: response.content as string,
    processedFiles,
    confidence: 0.9,
    operationChain: [{ operation: 'qa' as const, confidence: 0.9 }],
    totalSteps: 2,
    completedSteps: 2,
    queryId: queryId as string,
    responseMode: 'question_answering'
  }
}

// Helper function to fetch full file content with deduplication
const fetchFileContent = async (fileSearchResult: any): Promise<{
  fileCache: Map<string, string>,
  processedFiles: ProcessedFileInfo[],
  uniqueFiles: Map<string, any>
}> => {
  console.log("📁 Smart file fetching with deduplication for action performance")
  const fileCache = new Map<string, string>()
  const processedFiles: ProcessedFileInfo[] = []

  // Extract unique job IDs from the search results
  const jobIds = new Set<string>()
  fileSearchResult.files.forEach((file: any) => {
    const jobId = file.jobId || file.fileId.split('__')[0]
    jobIds.add(jobId)
  })

  // Fetch original files from embedding_jobs table
  let originalFiles: any[] = []
  try {
    originalFiles = await prisma.embeddingJob.findMany({
      where: {
        id: {
          in: Array.from(jobIds)
        },
        status: 'COMPLETED'
      },
      select: {
        id: true,
        fileName: true,
        originalName: true,
        fileType: true,
        fileSize: true,
        filePath: true,
        totalChunks: true,
        processedChunks: true,
        isOneDriveFile: true,
        oneDriveId: true,
        createdAt: true,
        completedAt: true
      }
    })
    console.log(`📁 Retrieved ${originalFiles.length} original files from database for action performance`)
  } catch (dbError) {
    console.error("❌ Failed to fetch original files from database:", dbError)
  }

  // Group files by fileId to avoid duplicate fetches
  const uniqueFiles = new Map<string, any>()
  for (const file of fileSearchResult.files) {
    if (!uniqueFiles.has(file.fileId)) {
      uniqueFiles.set(file.fileId, file)
    }
  }

  // Process original files instead of chunks
  for (const originalFile of originalFiles) {
    try {
      let content = ""
      
      // Try to get content from the file content API using job ID
      try {
        const contentResponse = await fetch('/api/document-processing/file-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileId: originalFile.id,
            fileName: originalFile.fileName
          })
        })
        
        if (contentResponse.ok) {
          const contentData = await contentResponse.json()
          if (contentData.success && contentData.content) {
            content = contentData.content
          }
        }
      } catch (fetchError) {
        console.warn(`Failed to fetch content for ${originalFile.fileName}:`, fetchError)
      }
      
      // If still no content, try to extract from URL if available
      if (!content && originalFile.filePath) {
        const extractionResult = await contentExtractionTool.invoke({
          fileUrl: originalFile.filePath,
          fileName: originalFile.fileName,
          content: content
        })
        
        if (extractionResult.success) {
          content = extractionResult.content
        }
      }

      // If still no content, create a placeholder
      if (!content) {
        content = `Content for ${originalFile.fileName} is not available. This file was processed but content could not be extracted.`
      }

      fileCache.set(originalFile.id, content)
      
      processedFiles.push({
        fileId: originalFile.id,
        fileName: originalFile.fileName,
        originalName: originalFile.originalName,
        fileSize: originalFile.fileSize,
        downloadUrl: originalFile.filePath || '',
        fileType: originalFile.fileType,
        jobId: originalFile.id,
        totalChunks: originalFile.totalChunks,
        processedChunks: originalFile.processedChunks,
        isOneDriveFile: originalFile.isOneDriveFile,
        oneDriveId: originalFile.oneDriveId
        // Removed: contentLength, url, content, createdAt, completedAt (not used in frontend)
      })

      console.log(`✅ Fetched content for ${originalFile.fileName} (${content.length} chars)`)
    } catch (error) {
      console.error(`❌ Failed to fetch content for ${originalFile.fileName}:`, error)
      
      // Add a fallback entry even if content fetch failed
      const fallbackContent = `Content for ${originalFile.fileName} could not be retrieved.`
      fileCache.set(originalFile.id, fallbackContent)
      
      processedFiles.push({
        fileId: originalFile.id,
        fileName: originalFile.fileName,
        originalName: originalFile.originalName,
        fileSize: originalFile.fileSize,
        downloadUrl: originalFile.filePath || '',
        fileType: originalFile.fileType,
        jobId: originalFile.id,
        totalChunks: originalFile.totalChunks,
        processedChunks: originalFile.processedChunks,
        isOneDriveFile: originalFile.isOneDriveFile,
        oneDriveId: originalFile.oneDriveId
        // Removed: contentLength, url, content, createdAt, completedAt (not used in frontend)
      })
    }
  }

  return { fileCache, processedFiles, uniqueFiles }
}

// Helper function to process action performance mode
const processActionPerformance = async (
  request: ProcessingRequest,
  fileCache: Map<string, string>,
  uniqueFiles: Map<string, any>,
  processedFiles: ProcessedFileInfo[],
  startTime: number
): Promise<ProcessingResponse> => {
  console.log("⚡ Processing as action performance")
  
  // Create agent for action performance
  const grok = new ChatXAI({
    apiKey: process.env.GROK_API_KEY,
    model: 'grok-4-latest',
    maxTokens: 4000,
    temperature: 0.1
  })

  // Create agent with file editing capabilities
  const tools = [fileEditingTool]
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a file editing assistant. You can edit files based on user instructions.
    
Available files:
${Array.from(uniqueFiles.values()).map(f => `- ${f.fileName} (ID: ${f.fileId})`).join('\n')}

When editing files, use the file_editing_tool with the original content and clear edit instructions.
After editing, provide a summary of what was changed.`],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"]
  ])

  const agent = createToolCallingAgent({
    llm: grok,
    tools,
    prompt
  })

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
    maxIterations: 3 // Limit iterations to prevent infinite loops
  })

  // Prepare context for the agent
  const fileContext = Array.from(fileCache.entries())
    .map(([fileId, content]) => {
      const file = Array.from(uniqueFiles.values()).find(f => f.fileId === fileId)
      return `File ID: ${fileId}\nFile Name: ${file?.fileName || 'Unknown'}\nContent:\n${content}\n---\n`
    })
    .join('\n')

  const agentInput = `User Request: ${request.userPrompt}

Available Files:
${fileContext}

Please perform the requested action on the appropriate files.`

  // Add timeout protection for agent execution
  const agentExecutionPromise = agentExecutor.invoke({ input: agentInput })
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Agent execution timeout')), 45000) // 45 second timeout
  )

  let result: any
  let finalResponse: string

  try {
    result = await Promise.race([agentExecutionPromise, timeoutPromise]) as any
    finalResponse = result.output
    console.log("✅ Agentic document processing completed successfully")
  } catch (error) {
    console.error("❌ Agent execution failed:", error)
    
    // Fallback: Provide a simple response when agent fails
    if (error instanceof Error && error.message.includes('timeout')) {
      finalResponse = `I apologize, but I encountered a timeout while processing your request. The files you mentioned (${Array.from(uniqueFiles.values()).map(f => f.fileName).join(', ')}) were found but I couldn't complete the analysis within the time limit. Please try with a more specific request or contact support if the issue persists.`
    } else {
      finalResponse = `I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. The files were found but I couldn't complete the analysis. Please try again with a different approach.`
    }
  }

  const toolsUsed = ['file_processing_tool', 'content_extraction_tool', 'file_editing_tool']

  // Save successful query to database
  const processingTime = Date.now() - startTime
  let queryId: string | null = null
  
  try {
    const savedQuery = await prisma.documentQuery.create({
      data: {
        userQuery: request.userPrompt,
        aiResponse: finalResponse,
        searchQuery: request.searchQuery,
        success: true,
        confidence: 0.9,
        processingTime,
        totalSteps: 3, // mode detection + file search + processing
        completedSteps: 3,
        toolsUsed,
        filesProcessed: processedFiles.length > 0 ? processedFiles as any : undefined
      }
    })
    queryId = savedQuery.id
    console.log(`💾 Query saved to database with ID: ${queryId}`)
  } catch (dbError) {
    console.error("❌ Failed to save query to database:", dbError)
  }

  return {
    success: true,
    result: finalResponse,
    processedFiles,
    confidence: 0.9,
    operationChain: [{ operation: 'action_performance' as const, confidence: 0.9 }],
    totalSteps: 3,
    completedSteps: 3,
    queryId: queryId as string,
    responseMode: 'action_performance',
    editedFiles: undefined
  }
}

// Helper function to save failed query to database
const saveFailedQuery = async (
  request: ProcessingRequest, 
  error: any, 
  startTime: number
): Promise<string | null> => {
  const processingTime = Date.now() - startTime
  try {
    const savedQuery = await prisma.documentQuery.create({
      data: {
        userQuery: request.userPrompt,
        aiResponse: "",
        searchQuery: request.searchQuery,
        success: false,
        error: String(error),
        processingTime,
        totalSteps: 1,
        completedSteps: 0,
        toolsUsed: []
      }
    })
    console.log(`💾 Failed query saved to database with ID: ${savedQuery.id}`)
    return savedQuery.id
  } catch (dbError) {
    console.error("❌ Failed to save error to database:", dbError)
    return null
  }
}

// Main document processing function - now much cleaner and more readable
const processDocuments = async (request: ProcessingRequest): Promise<ProcessingResponse> => {
  const startTime = Date.now()
  
  try {
    console.log("🚀 Starting agentic document processing")

    // Step 1: Detect response mode
    const responseMode = await detectResponseMode(request.userPrompt)

    // Step 2: Find relevant files
    const fileSearchResult = await searchRelevantFiles(request.searchQuery || request.userPrompt)

    // Step 3: Process based on response mode
    if (responseMode === 'question_answering') {
      return await processQuestionAnswering(request, fileSearchResult, startTime)
    } else {
      // Step 4: Fetch full file content for action performance
      const { fileCache, processedFiles, uniqueFiles } = await fetchFileContent(fileSearchResult)
      
      // Step 5: Process action performance
      return await processActionPerformance(request, fileCache, uniqueFiles, processedFiles, startTime)
    }

  } catch (error) {
    console.error("❌ Agentic document processing failed:", error)
    
    const queryId = await saveFailedQuery(request, error, startTime)
    
    return {
      success: false,
      error: `Processing failed: ${error}`,
      queryId: queryId as string
    }
  }
}

// POST handler for REST API
export const POST = async (request: NextRequest): Promise<NextResponse<ProcessingResponse>> => {
  try {
    const body: ProcessingRequest = await request.json()
    const { userPrompt, searchQuery } = body

    if (!userPrompt) {
      return NextResponse.json({
        success: false,
        error: 'User prompt is required'
      }, { status: 400 })
    }

    const result = await processDocuments({ userPrompt, searchQuery })

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 500 })
    }

  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during document processing'
    }, { status: 500 })
  }
}