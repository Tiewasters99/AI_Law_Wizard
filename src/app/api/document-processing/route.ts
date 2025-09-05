import { NextRequest, NextResponse } from 'next/server'
import { ChatXAI } from '@langchain/xai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { StateGraph, END, START } from '@langchain/langgraph'
import { MemorySaver } from '@langchain/langgraph'
import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { prisma } from '../../../lib/database'
import { searchRelevant } from '../../lib/retrival'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import mammoth from 'mammoth'

// Progress Event Types for Real-time Updates
enum ProgressEventType {
  STARTED = 'started',
  CLASSIFICATION = 'classification',
  FILES_SEARCH = 'files_search',
  FILES_FOUND = 'files_found',
  CHAIN_DETECTED = 'chain_detected',
  OPERATION_START = 'operation_start',
  OPERATION_PROGRESS = 'operation_progress',
  OPERATION_COMPLETE = 'operation_complete',
  INTERMEDIATE_RESULT = 'intermediate_result',
  FINAL_RESULT = 'final_result',
  COMPLETE = 'complete',
  ERROR = 'error'
}

interface ProgressEvent {
  id: string
  type: ProgressEventType
  timestamp: string
  message: string
  step?: number
  totalSteps?: number
  operation?: string
  confidence?: number
  data?: any
  error?: string
}

// Progress Emitter for Real-time Updates
class ProgressEmitter {
  private writer: WritableStreamDefaultWriter<Uint8Array>
  private encoder: TextEncoder
  private eventId: number
  private requestId: string
  private isClosed: boolean = false

  constructor(writer: WritableStreamDefaultWriter<Uint8Array>, requestId: string) {
    this.writer = writer
    this.encoder = new TextEncoder()
    this.eventId = 0
    this.requestId = requestId
  }

  private async emit(event: ProgressEvent): Promise<void> {
    if (this.isClosed) {
      return // Silently skip if stream is closed
    }
    
    try {
      const eventData = `data: ${JSON.stringify(event)}\n\n`
      await this.writer.write(this.encoder.encode(eventData))
    } catch (error) {
      console.error('Error emitting progress event:', error)
      this.isClosed = true // Mark as closed on write error
    }
  }

  private generateEvent(
    type: ProgressEventType,
    message: string,
    options: Partial<ProgressEvent> = {}
  ): ProgressEvent {
    return {
      id: `${this.requestId}-${++this.eventId}`,
      type,
      timestamp: new Date().toISOString(),
      message,
      ...options
    }
  }

  async emitStarted(message: string = 'Document processing started'): Promise<void> {
    await this.emit(this.generateEvent(ProgressEventType.STARTED, message))
  }

  async emitClassification(classification: any, message: string): Promise<void> {
    await this.emit(this.generateEvent(
      ProgressEventType.CLASSIFICATION,
      message,
      {
        operation: classification.operationChain?.[0]?.operation,
        confidence: classification.overallConfidence,
        data: {
          isChain: classification.isChain,
          operationChain: classification.operationChain,
          reasoning: classification.reasoning
        }
      }
    ))
  }

  async emitChainDetected(operationChain: OperationStep[], totalSteps: number): Promise<void> {
    const operations = operationChain.map(step => step.operation).join(' → ')
    await this.emit(this.generateEvent(
      ProgressEventType.CHAIN_DETECTED,
      `Detected operation chain: ${operations}`,
      {
        totalSteps,
        data: { operationChain }
      }
    ))
  }

  async emitFilesSearch(query: string): Promise<void> {
    await this.emit(this.generateEvent(
      ProgressEventType.FILES_SEARCH,
      `Searching for relevant files: "${query}"`
    ))
  }

  async emitFilesFound(files: ProcessedFileInfo[], count: number): Promise<void> {
    await this.emit(this.generateEvent(
      ProgressEventType.FILES_FOUND,
      `Found ${count} relevant document${count !== 1 ? 's' : ''}`,
      {
        data: {
          fileCount: count,
          files: files.map(f => ({
            fileName: f.originalName,
            fileSize: f.fileSize,
            fileType: f.originalName.split('.').pop()
          }))
        }
      }
    ))
  }

  async emitOperationStart(
    operation: string,
    step: number,
    totalSteps: number,
    description?: string
  ): Promise<void> {
    const message = totalSteps > 1
      ? `Step ${step}/${totalSteps}: Starting ${operation}${description ? ` - ${description}` : ''}`
      : `Starting ${operation} operation${description ? ` - ${description}` : ''}`

    await this.emit(this.generateEvent(
      ProgressEventType.OPERATION_START,
      message,
      { step, totalSteps, operation }
    ))
  }

  async emitOperationProgress(
    operation: string,
    message: string,
    step: number,
    totalSteps: number
  ): Promise<void> {
    await this.emit(this.generateEvent(
      ProgressEventType.OPERATION_PROGRESS,
      message,
      { step, totalSteps, operation }
    ))
  }

  async emitOperationComplete(
    operation: string,
    step: number,
    totalSteps: number,
    resultPreview?: string
  ): Promise<void> {
    const message = totalSteps > 1
      ? `Step ${step}/${totalSteps}: ${operation} completed successfully`
      : `${operation} operation completed successfully`

    await this.emit(this.generateEvent(
      ProgressEventType.OPERATION_COMPLETE,
      message,
      {
        step,
        totalSteps,
        operation,
        data: resultPreview ? { resultPreview: resultPreview.substring(0, 200) + '...' } : undefined
      }
    ))
  }

  async emitIntermediateResult(
    result: string,
    step: number,
    totalSteps: number,
    operation: string
  ): Promise<void> {
    await this.emit(this.generateEvent(
      ProgressEventType.INTERMEDIATE_RESULT,
      `Intermediate result from step ${step}/${totalSteps} available`,
      {
        step,
        totalSteps,
        operation,
        data: {
          result: result.substring(0, 500) + (result.length > 500 ? '...' : ''),
          fullResultLength: result.length
        }
      }
    ))
  }

  async emitFinalResult(result: string, totalSteps: number): Promise<void> {
    await this.emit(this.generateEvent(
      ProgressEventType.FINAL_RESULT,
      'Final processing result ready',
      {
        totalSteps,
        data: {
          resultPreview: result.substring(0, 300) + (result.length > 300 ? '...' : ''),
          fullResultLength: result.length
        }
      }
    ))
  }

  async emitComplete(
    processingTime: number,
    totalSteps: number,
    isChain: boolean
  ): Promise<void> {
    const message = isChain
      ? `Operation chain completed successfully in ${processingTime.toFixed(1)}s`
      : `Processing completed successfully in ${processingTime.toFixed(1)}s`

    await this.emit(this.generateEvent(
      ProgressEventType.COMPLETE,
      message,
      {
        totalSteps,
        data: { processingTime, isChain }
      }
    ))
  }

  async emitError(error: string, step?: number, operation?: string): Promise<void> {
    await this.emit(this.generateEvent(
      ProgressEventType.ERROR,
      `Error: ${error}`,
      { error, step, operation }
    ))
  }

  async close(): Promise<void> {
    if (this.isClosed) {
      return // Already closed
    }
    
    this.isClosed = true
    try {
      await this.writer.close()
    } catch (error) {
      console.error('Error closing progress stream:', error)
    }
  }

  isStreamClosed(): boolean {
    return this.isClosed
  }
}

// Enhanced State Interface for Chained Operations
interface OperationStep {
  operation: 'summary' | 'file_operation' | 'qa' | 'analysis' | 'extraction' | 'transformation'
  fileOperationType?: 'merge' | 'append'
  description?: string
  confidence?: number
}

interface DocumentProcessingState {
  userPrompt: string
  searchQuery?: string
  processedFiles: ProcessedFileInfo[]
  result?: string
  error?: string
  logs: string[]
  // Enhanced for chaining
  operationChain?: OperationStep[]
  currentStep?: number
  intermediateResults?: string[]
  operation?: 'summary' | 'file_operation' | 'qa' | 'analysis' | 'extraction' | 'transformation'
  fileOperationType?: 'merge' | 'append'
  selectedFiles?: string[]
  requestId: string
  confidence?: number
  metadata?: Record<string, any>
  // LangGraph specific fields
  messages?: Array<{ role: string; content: string }>
}

interface ProcessingRequest {
  userPrompt: string
  searchQuery?: string
}

interface ProcessingResponse {
  success: boolean
  result?: string
  error?: string
  generatedFile?: string
  fileName?: string
  logs?: string[]
  processedFiles?: ProcessedFileInfo[]
  // Enhanced response fields
  workflowId?: string
  confidence?: number
  stepDurations?: Record<string, number>
  metadata?: Record<string, any>
  operation?: string
  // Operation chain fields
  operationChain?: OperationStep[]
  intermediateResults?: string[]
  isChain?: boolean
  totalSteps?: number
  completedSteps?: number
}

interface ProcessedFileInfo {
  fileId: string
  fileName: string
  originalName: string
  contentLength: number
  fileSize: number
  url: string
}

// LangGraph Tools Definition
const fileProcessingTool = tool(
  async (input) => {
    const { query, limit = 5 } = input as { query: string; limit?: number }
    try {
      const relevantChunks = await searchRelevant(query, limit)
      if (relevantChunks.length === 0) {
        return { success: false, files: [], error: "No relevant files found" }
      }

      const fileIds = [...new Set(
        relevantChunks
          .map(chunk => chunk.metadata?.fileId || chunk.id)
          .filter(Boolean)
          .map(embeddingId => embeddingId.includes('__') ? embeddingId.split('__')[0] : embeddingId)
      )]

      const fileInfos = await prisma.embeddingJob.findMany({
        where: { fileName: { in: fileIds } },
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

      const processedFiles = fileInfos
        .filter(fileInfo => fileInfo.filePath)
        .map((fileInfo) => ({
          fileId: fileInfo.id,
          fileName: fileInfo.fileName,
          originalName: fileInfo.originalName,
          contentLength: 0, // Will be filled when content is extracted
          fileSize: fileInfo.fileSize || 0,
          url: fileInfo.filePath!
        }))

      return { success: true, files: processedFiles, error: null }
    } catch (error) {
      return { success: false, files: [], error: String(error) }
    }
  },
  {
    name: "file_processing_tool",
    description: "Search and fetch relevant files from the vector database",
    schema: z.object({
      query: z.string().describe("Search query for finding relevant files"),
      limit: z.number().optional().default(5).describe("Maximum number of files to return")
    })
  }
)

const enhancedOperationClassifierTool = tool(
  async (input) => {
    const { userPrompt } = input as { userPrompt: string }
    
    try {
      const grok = new ChatXAI({
        apiKey: process.env.GROK_API_KEY,
        model: 'grok-4',
        maxTokens: 1000, // Increased for chain detection
        temperature: 0.1
      })

      const classificationPrompt = `You are an intelligent operation chain classifier for a document processing system. Analyze the user's request to identify if they want a single operation OR a sequence of operations.

Available Operations:
1. **summary** - Generate summaries, overviews, descriptions, or explanations
2. **file_operation** - Merge, combine, append, join, or concatenate documents
3. **qa** - Answer questions, provide specific information
4. **analysis** - Deep analysis, comparison, insights, patterns
5. **extraction** - Extract specific data, tables, key points
6. **transformation** - Convert, reformat, restructure, modify content

Sequential Keywords: "first", "then", "after", "next", "finally", "and then", "followed by", "subsequently"

User Request: "${userPrompt}"

Analyze if this is:
- SINGLE OPERATION: One clear task
- OPERATION CHAIN: Multiple tasks in sequence (look for sequential keywords or logical flow)

Respond with a JSON object:
{
  "isChain": true/false,
  "operationChain": [
    {
      "operation": "extraction/analysis/summary/etc",
      "description": "what this step does",
      "confidence": 0.0-1.0,
      "fileOperationType": "merge/append (only for file_operation)"
    }
  ],
  "reasoning": "explanation of your analysis",
  "overallConfidence": 0.0-1.0
}

Examples:
- "Summarize these documents" → Single operation
- "First extract financial data, then analyze trends" → Chain of 2 operations
- "Extract data, analyze it, and create a summary report" → Chain of 3 operations

Important:
- If isChain=false, operationChain should have exactly 1 item
- If isChain=true, operationChain should have 2+ items in logical sequence
- Each step should build on previous results
- High confidence for clear sequences, lower for ambiguous requests`

      const response = await grok.invoke([new HumanMessage(classificationPrompt)])
      const responseText = response.content as string
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not parse classification response')
      }
      
      const classification = JSON.parse(jsonMatch[0])
      
      // Validate the response
      const validOperations = ['summary', 'file_operation', 'qa', 'analysis', 'extraction', 'transformation']
      
      // Validate each operation in the chain
      if (classification.operationChain && Array.isArray(classification.operationChain)) {
        classification.operationChain.forEach((step: any) => {
          if (!validOperations.includes(step.operation)) {
            step.operation = 'qa' // fallback
          }
          step.confidence = Math.max(0.0, Math.min(1.0, step.confidence || 0.7))
        })
      } else {
        // Fallback to single QA operation
        classification.operationChain = [{
          operation: 'qa',
          description: 'Answer user question',
          confidence: 0.6
        }]
        classification.isChain = false
      }
      
      classification.overallConfidence = Math.max(0.0, Math.min(1.0, classification.overallConfidence || 0.7))
      
      return {
        isChain: classification.isChain,
        operationChain: classification.operationChain,
        reasoning: classification.reasoning,
        overallConfidence: classification.overallConfidence,
        classificationScores: {
          llmClassified: true,
          chainDetected: classification.isChain,
          stepCount: classification.operationChain?.length || 1
        }
      }
    } catch (error) {
      console.error('Enhanced classification failed, falling back to simple classification:', error)
      
      // Fallback to basic keyword matching
      const prompt = userPrompt.toLowerCase()
      let operation: 'summary' | 'file_operation' | 'qa' | 'analysis' | 'extraction' | 'transformation' = 'qa'
      let confidence = 0.6
      
      if (prompt.includes('summary') || prompt.includes('summarize')) {
        operation = 'summary'
        confidence = 0.8
      } else if (prompt.includes('extract')) {
        operation = 'extraction'
        confidence = 0.7
      } else if (prompt.includes('analyz')) {
        operation = 'analysis'
        confidence = 0.7
      }
      
      return {
        isChain: false,
        operationChain: [{
          operation,
          description: `Perform ${operation} operation`,
          confidence
        }],
        reasoning: 'Fallback classification due to LLM error',
        overallConfidence: confidence,
        classificationScores: {
          llmClassified: false,
          fallbackUsed: true,
          error: String(error)
        }
      }
    }
  },
  {
    name: "enhanced_operation_classifier_tool",
    description: "Intelligently classify user requests to identify single operations or operation chains",
    schema: z.object({
      userPrompt: z.string().describe("The user's prompt to classify")
    })
  }
)

// Keep the original classifier for backward compatibility
const operationClassifierTool = enhancedOperationClassifierTool

const contentExtractionTool = tool(
  async (input) => {
    const { fileUrl, fileName } = input as { fileUrl: string; fileName: string }
    try {
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      const content = await extractFileContent(buffer, fileName, { log: () => {}, getLogs: () => [] })
      
      return { success: true, content, error: null }
    } catch (error) {
      return { success: false, content: "", error: String(error) }
    }
  },
  {
    name: "content_extraction_tool",
    description: "Extract content from a file URL",
    schema: z.object({
      fileUrl: z.string().describe("URL of the file to extract content from"),
      fileName: z.string().describe("Name of the file for format detection")
    })
  }
)

// Create tools node
const toolNode = new ToolNode([fileProcessingTool, operationClassifierTool, contentExtractionTool])

// File type validation utility
const validateFileType = (fileName: string): { isValid: boolean; fileType: string; supportLevel: 'full' | 'partial' | 'text-only' } => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
  
  const supportedTypes = {
    // Full support with rich content extraction
    pdf: { isValid: true, supportLevel: 'full' as const },
    docx: { isValid: true, supportLevel: 'full' as const },
    doc: { isValid: true, supportLevel: 'full' as const },
    
    // Partial support with basic extraction
    txt: { isValid: true, supportLevel: 'partial' as const },
    rtf: { isValid: true, supportLevel: 'partial' as const },
    json: { isValid: true, supportLevel: 'partial' as const },
    
    // Text-only fallback
    md: { isValid: true, supportLevel: 'text-only' as const },
    csv: { isValid: true, supportLevel: 'text-only' as const },
    xml: { isValid: true, supportLevel: 'text-only' as const }
  }
  
  const typeInfo = supportedTypes[fileExtension as keyof typeof supportedTypes]
  
  return {
    isValid: !!typeInfo,
    fileType: fileExtension,
    supportLevel: typeInfo?.supportLevel || 'text-only'
  }
}

// Simple logger for tools
const createLogger = () => ({
  log: (message: string) => console.log(message),
  getLogs: () => []
})

// Enhanced file content extraction with validation and error handling
const extractFileContent = async (fileBuffer: Buffer, fileName: string, logger: ReturnType<typeof createLogger> = createLogger()) => {
  const validation = validateFileType(fileName)
  
  logger.log(`Extracting content from file: ${fileName} (type: ${validation.fileType}, support: ${validation.supportLevel})`)
  
  if (!validation.isValid) {
    logger.log(`Unsupported file type: ${validation.fileType}, attempting text extraction`)
  }
  
  const extractors = {
    pdf: () => extractPDFContent(fileBuffer, logger),
    doc: () => extractWordContent(fileBuffer, logger),
    docx: () => extractWordContent(fileBuffer, logger),
    txt: () => extractTextContent(fileBuffer, logger),
    rtf: () => extractRTFContent(fileBuffer, logger),
    json: () => extractJSONContent(fileBuffer, logger)
  }
  
  try {
    const extractor = extractors[validation.fileType as keyof typeof extractors] ?? (() => extractTextContent(fileBuffer, logger))
    const content = await extractor()
    
    // Validate extracted content
    if (!content || content.trim().length === 0) {
      throw new Error('No content could be extracted from the file')
    }
    
    if (content.length < 10) {
      logger.log(`Warning: Very short content extracted (${content.length} chars)`)
    }
    
    logger.log(`Successfully extracted ${content.length} characters from ${fileName}`)
    return content
  } catch (error) {
    logger.log(`Error extracting content from ${fileName}: ${error}`)
    throw new Error(`Failed to extract content from ${fileName}: ${error}`)
  }
}

// Modern ES6 extraction functions using arrow functions
const extractPDFContent = async (buffer: Buffer, logger: ReturnType<typeof createLogger>) => {
  try {
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    if (arrayBuffer instanceof SharedArrayBuffer) {
      throw new Error('SharedArrayBuffer is not supported for PDF processing')
    }
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
    const loader = new PDFLoader(blob)
    const docs = await loader.load()
    const text = docs.map(doc => doc.pageContent).join('\n')
    
    logger.log(`PDF content extracted, pages: ${docs.length}, text length: ${text.length}`)
    return text
  } catch (error) {
    logger.log(`PDF parsing error: ${error}`)
    throw error
  }
}

const extractWordContent = async (buffer: Buffer, logger: ReturnType<typeof createLogger>) => {
  try {
    const { value } = await mammoth.extractRawText({ buffer })
    logger.log(`Word document content extracted, text length: ${value.length}`)
    return value
  } catch (error) {
    logger.log(`Word document parsing error: ${error}`)
    throw error
  }
}

const extractTextContent = async (buffer: Buffer, logger: ReturnType<typeof createLogger>) => {
  try {
    const text = buffer.toString('utf-8')
    logger.log(`Text content extracted, length: ${text.length}`)
    return text
  } catch (error) {
    logger.log(`Text parsing error: ${error}`)
    throw error
  }
}

const extractRTFContent = async (buffer: Buffer, logger: ReturnType<typeof createLogger>) => {
  try {
    const text = buffer.toString('utf-8')
    const cleanText = text.replace(/\\[a-z0-9-]+\d?/g, '').replace(/\{|\}/g, '').trim()
    logger.log(`RTF content extracted, original length: ${text.length}, cleaned length: ${cleanText.length}`)
    return cleanText
  } catch (error) {
    logger.log(`RTF parsing error: ${error}`)
    throw error
  }
}

const extractJSONContent = async (buffer: Buffer, logger: ReturnType<typeof createLogger>) => {
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

// Remove unused code - using tools instead

// Enhanced LangGraph Node Functions with Real-time Progress Support
const classifyOperationNode = async (state: DocumentProcessingState, emitter?: ProgressEmitter) => {
  console.log("🎯 Classifying operation for:", state.userPrompt)
  
  try {
    const classification = await enhancedOperationClassifierTool.invoke({ userPrompt: state.userPrompt })
    
    const isChain = classification.isChain
    const operationChain = classification.operationChain
    
    const logEntry = isChain 
      ? `Detected operation chain with ${operationChain.length} steps: ${operationChain.map((step: any) => step.operation).join(' → ')}`
      : `Classified single operation: ${operationChain[0].operation} (confidence: ${operationChain[0].confidence.toFixed(2)})`
    
    // Emit classification event
    if (emitter) {
      await emitter.emitClassification(classification, logEntry)
      
      if (isChain) {
        await emitter.emitChainDetected(operationChain, operationChain.length)
      }
    }
    
    return {
      ...state,
      operationChain,
      currentStep: 0,
      intermediateResults: [],
      // For backward compatibility, set operation to first step
      operation: operationChain[0]?.operation,
      confidence: classification.overallConfidence,
      fileOperationType: operationChain[0]?.fileOperationType,
      logs: [...state.logs, logEntry],
      metadata: {
        ...state.metadata,
        classificationScores: classification.classificationScores,
        isChain,
        totalSteps: operationChain.length
      }
    }
  } catch (error) {
    const errorMessage = `Classification failed: ${error}`
    if (emitter) {
      await emitter.emitError(errorMessage)
    }
    
    return {
      ...state,
      error: errorMessage,
      logs: [...state.logs, `Classification error: ${error}`]
    }
  }
}

const fetchFilesNode = async (state: DocumentProcessingState, emitter?: ProgressEmitter) => {
  console.log("📁 Fetching relevant files for query:", state.searchQuery || state.userPrompt)
  
  try {
    const query = state.searchQuery || state.userPrompt
    
    // Emit files search event
    if (emitter) {
      await emitter.emitFilesSearch(query)
    }
    
    const fileResult = await fileProcessingTool.invoke({ query, limit: 5 })
    
    if (!fileResult.success || fileResult.files.length === 0) {
      const errorMessage = fileResult.error || 'No relevant files found in the database'
      if (emitter) {
        await emitter.emitError(errorMessage)
      }
      
      return {
        ...state,
        error: errorMessage,
        logs: [...state.logs, `No files found for query: ${query}`]
      }
    }

    const logEntry = `Successfully fetched ${fileResult.files.length} relevant files`
    
    // Emit files found event
    if (emitter) {
      await emitter.emitFilesFound(fileResult.files, fileResult.files.length)
    }

    return {
      ...state,
      processedFiles: fileResult.files,
      logs: [...state.logs, logEntry],
      metadata: {
        ...state.metadata,
        filesFound: fileResult.files.length,
        fileTypes: [...new Set(fileResult.files.map(f => f.originalName.split('.').pop()?.toLowerCase()))]
      }
    }
  } catch (error) {
    const errorMessage = `Failed to fetch files: ${error}`
    if (emitter) {
      await emitter.emitError(errorMessage)
    }
    
    return {
      ...state,
      error: errorMessage,
      logs: [...state.logs, `File fetch error: ${error}`]
    }
  }
}

const handleSummaryNode = async (state: DocumentProcessingState, emitter?: ProgressEmitter) => {
  console.log("📝 Generating summary for", state.processedFiles.length, "files")
  
  try {
    const grok = new ChatXAI({
      apiKey: process.env.GROK_API_KEY,
      model: 'grok-4',
      maxTokens: 4000,
      temperature: 0.3
    })

    // Emit progress for content extraction
    if (emitter) {
      await emitter.emitOperationProgress(
        'summary',
        `Extracting content from ${state.processedFiles.length} files`,
        state.currentStep || 1,
        state.operationChain?.length || 1
      )
    }

    // Extract content from all files using our tool
    const allContent = await Promise.all(
      state.processedFiles.map(async (file) => {
        try {
          const extraction = await contentExtractionTool.invoke({
            fileUrl: file.url,
            fileName: file.originalName
          })
          
          if (extraction.success) {
            return `=== FILE: ${file.originalName} ===\n${extraction.content}\n`
          } else {
            return `[Error processing ${file.originalName}: ${extraction.error}]`
          }
    } catch (error) {
          return `[Error processing ${file.originalName}: ${error}]`
        }
      })
    )

    const combinedContent = allContent.join('\n---\n')
    
    // Emit progress for AI processing
    if (emitter) {
      await emitter.emitOperationProgress(
        'summary',
        'Generating summary with AI',
        state.currentStep || 1,
        state.operationChain?.length || 1
      )
    }
    
    const summaryPrompt = `Please provide a comprehensive summary of the following documents:

${combinedContent}

User's request: ${state.userPrompt}

Please provide a clear, organized summary highlighting key points, main topics, and important information from all the documents.`

    const response = await grok.invoke([new HumanMessage(summaryPrompt)])
    const result = response.content as string
    
    return {
      ...state,
      result,
      logs: [...state.logs, 'Summary generated successfully']
    }
    } catch (error) {
    const errorMessage = `Failed to generate summary: ${error}`
    if (emitter) {
      await emitter.emitError(errorMessage, state.currentStep, 'summary')
    }
    
    return {
      ...state,
      error: errorMessage,
      logs: [...state.logs, `Summary error: ${error}`]
    }
  }
}

const handleFileOperationNode = async (state: DocumentProcessingState, emitter?: ProgressEmitter) => {
  console.log("🔗 Performing file operation:", state.fileOperationType)
  
  try {
    if (state.processedFiles.length < 2) {
      return {
        ...state,
        error: 'At least 2 files are required for file operations',
        logs: [...state.logs, 'File operation failed: insufficient files']
      }
    }

    // Extract content from first 2 files
    const fileContents = await Promise.all(
      state.processedFiles.slice(0, 2).map(async (file) => {
        const extraction = await contentExtractionTool.invoke({
          fileUrl: file.url,
          fileName: file.originalName
        })
        
        if (extraction.success) {
          return { name: file.originalName, content: extraction.content }
        } else {
          throw new Error(`Failed to process ${file.originalName}: ${extraction.error}`)
        }
      })
    )

    let result = ''
    const timestamp = new Date().toISOString()

    if (state.fileOperationType === 'merge') {
      result = `MERGED DOCUMENT
Created: ${timestamp}
Source Files: ${fileContents.map(f => f.name).join(', ')}
Operation: ${state.userPrompt}

${fileContents.map(f => `=== ${f.name} ===\n${f.content}`).join('\n\n---\n\n')}

--- END OF MERGED DOCUMENT ---`
    } else {
      result = `APPENDED DOCUMENT
Created: ${timestamp}
Source Files: ${fileContents.map(f => f.name).join(', ')}
Operation: ${state.userPrompt}

${fileContents.map(f => f.content).join('\n\n')}

--- END OF APPENDED DOCUMENT ---`
    }
    
    return {
      ...state,
      result,
      logs: [...state.logs, `File operation completed: ${state.fileOperationType}`]
    }
  } catch (error) {
    return {
      ...state,
      error: `Failed to perform file operation: ${error}`,
      logs: [...state.logs, `File operation error: ${error}`]
    }
  }
}

const handleQANode = async (state: DocumentProcessingState, emitter?: ProgressEmitter) => {
  console.log("❓ Handling Q&A for", state.processedFiles.length, "files")
  
  try {
    const grok = new ChatXAI({
      apiKey: process.env.GROK_API_KEY,
      model: 'grok-4',
      maxTokens: 4000,
      temperature: 0.3
    })

    // Emit progress for content extraction
    if (emitter) {
      await emitter.emitOperationProgress(
        'qa',
        `Processing ${state.processedFiles.length} files for Q&A`,
        state.currentStep || 1,
        state.operationChain?.length || 1
      )
    }

    // Extract content from all files using our tool
    const allContent = await Promise.all(
      state.processedFiles.map(async (file) => {
        try {
          const extraction = await contentExtractionTool.invoke({
            fileUrl: file.url,
            fileName: file.originalName
          })
          
          if (extraction.success) {
            return `=== FILE: ${file.originalName} ===\n${extraction.content}\n`
          } else {
            return `[Error processing ${file.originalName}: ${extraction.error}]`
          }
            } catch (error) {
          return `[Error processing ${file.originalName}: ${error}]`
        }
      })
    )

    const combinedContent = allContent.join('\n---\n')
    
    // Emit progress for AI processing
    if (emitter) {
      await emitter.emitOperationProgress(
        'qa',
        'Analyzing documents and formulating answer',
        state.currentStep || 1,
        state.operationChain?.length || 1
      )
    }
    
    const qaPrompt = `Based on the following documents, please answer the user's question:

Documents:
${combinedContent}

Question: ${state.userPrompt}

Please provide a detailed answer based on the information available in the documents. If the information is not available in the documents, please state that clearly.`

    const response = await grok.invoke([new HumanMessage(qaPrompt)])
    const result = response.content as string
    
    return {
      ...state,
      result,
      logs: [...state.logs, 'Q&A response generated successfully']
    }
  } catch (error) {
    const errorMessage = `Failed to answer question: ${error}`
    if (emitter) {
      await emitter.emitError(errorMessage, state.currentStep, 'qa')
    }
    
    return {
      ...state,
      error: errorMessage,
      logs: [...state.logs, `Q&A error: ${error}`]
    }
  }
}

const handleAnalysisNode = async (state: DocumentProcessingState, emitter?: ProgressEmitter) => {
  console.log("🔍 Performing deep analysis for", state.processedFiles.length, "files")
  
  try {
    const grok = new ChatXAI({
      apiKey: process.env.GROK_API_KEY,
      model: 'grok-4',
      maxTokens: 4000,
      temperature: 0.4 // Slightly higher for creative analysis
    })

    // Extract content from all files using our tool
    const allContent = await Promise.all(
      state.processedFiles.map(async (file) => {
        try {
          const extraction = await contentExtractionTool.invoke({
            fileUrl: file.url,
            fileName: file.originalName
          })
          
          if (extraction.success) {
            return `=== FILE: ${file.originalName} ===\n${extraction.content}\n`
          } else {
            return `[Error processing ${file.originalName}: ${extraction.error}]`
          }
        } catch (error) {
          return `[Error processing ${file.originalName}: ${error}]`
        }
      })
    )

    const combinedContent = allContent.join('\n---\n')
    
    const analysisPrompt = `Perform a comprehensive analysis of the following documents based on the user's request:

Documents:
${combinedContent}

Analysis Request: ${state.userPrompt}

Please provide:
1. Key insights and patterns
2. Comparative analysis (if multiple documents)
3. Trends and themes
4. Critical points and recommendations
5. Supporting evidence from the documents

Focus on delivering actionable insights and thorough examination of the content.`

    const response = await grok.invoke([new HumanMessage(analysisPrompt)])
    const result = response.content as string
    
    return {
      ...state,
      result,
      logs: [...state.logs, 'Deep analysis completed successfully']
    }
  } catch (error) {
    return {
      ...state,
      error: `Failed to perform analysis: ${error}`,
      logs: [...state.logs, `Analysis error: ${error}`]
    }
  }
}

const handleExtractionNode = async (state: DocumentProcessingState, emitter?: ProgressEmitter) => {
  console.log("📊 Extracting specific information from", state.processedFiles.length, "files")
  
  try {
    const grok = new ChatXAI({
      apiKey: process.env.GROK_API_KEY,
      model: 'grok-4',
      maxTokens: 4000,
      temperature: 0.2 // Low temperature for precise extraction
    })

    // Extract content from all files using our tool
    const allContent = await Promise.all(
      state.processedFiles.map(async (file) => {
        try {
          const extraction = await contentExtractionTool.invoke({
            fileUrl: file.url,
            fileName: file.originalName
          })
          
          if (extraction.success) {
            return `=== FILE: ${file.originalName} ===\n${extraction.content}\n`
          } else {
            return `[Error processing ${file.originalName}: ${extraction.error}]`
          }
        } catch (error) {
          return `[Error processing ${file.originalName}: ${error}]`
        }
      })
    )

    const combinedContent = allContent.join('\n---\n')
    
    const extractionPrompt = `Extract specific information from the following documents based on the user's request:

Documents:
${combinedContent}

Extraction Request: ${state.userPrompt}

Please:
1. Identify and extract the specific data, information, or elements requested
2. Present extracted information in a clear, structured format
3. Include source file references for each piece of extracted data
4. Organize data logically (tables, lists, or categories as appropriate)
5. Highlight any missing or incomplete information

Focus on precision and completeness in extraction.`

    const response = await grok.invoke([new HumanMessage(extractionPrompt)])
    const result = response.content as string
    
    return {
      ...state,
      result,
      logs: [...state.logs, 'Information extraction completed successfully']
    }
  } catch (error) {
    return {
      ...state,
      error: `Failed to extract information: ${error}`,
      logs: [...state.logs, `Extraction error: ${error}`]
    }
  }
}

const handleTransformationNode = async (state: DocumentProcessingState, emitter?: ProgressEmitter) => {
  console.log("🔄 Transforming content from", state.processedFiles.length, "files")
  
  try {
    const grok = new ChatXAI({
      apiKey: process.env.GROK_API_KEY,
      model: 'grok-4',
      maxTokens: 4000,
      temperature: 0.3
    })

    // Extract content from all files using our tool
    const allContent = await Promise.all(
      state.processedFiles.map(async (file) => {
        try {
          const extraction = await contentExtractionTool.invoke({
            fileUrl: file.url,
            fileName: file.originalName
          })
          
          if (extraction.success) {
            return `=== FILE: ${file.originalName} ===\n${extraction.content}\n`
          } else {
            return `[Error processing ${file.originalName}: ${extraction.error}]`
          }
        } catch (error) {
          return `[Error processing ${file.originalName}: ${error}]`
        }
      })
    )

    const combinedContent = allContent.join('\n---\n')
    
    const transformationPrompt = `Transform the following document content according to the user's request:

Documents:
${combinedContent}

Transformation Request: ${state.userPrompt}

Please:
1. Transform the content according to the specified format or structure
2. Maintain accuracy and completeness of the original information
3. Apply the requested formatting, style, or organizational changes
4. Ensure the transformed content meets the user's requirements
5. Preserve source attribution where relevant

Focus on accurate transformation while maintaining information integrity.`

    const response = await grok.invoke([new HumanMessage(transformationPrompt)])
    const result = response.content as string
    
    return {
      ...state,
      result,
      logs: [...state.logs, 'Content transformation completed successfully']
    }
  } catch (error) {
    return {
      ...state,
      error: `Failed to transform content: ${error}`,
      logs: [...state.logs, `Transformation error: ${error}`]
    }
  }
}

// Remove unused conditional routing function

// Enhanced execution function that handles operation chains with SSE support
const executeOperationStep = async (
  state: DocumentProcessingState, 
  stepIndex: number, 
  emitter?: ProgressEmitter
): Promise<DocumentProcessingState> => {
  const currentStep = state.operationChain?.[stepIndex]
  if (!currentStep) {
    const errorMessage = `Invalid step index: ${stepIndex}`
    if (emitter) {
      await emitter.emitError(errorMessage, stepIndex)
    }
    return {
      ...state,
      error: errorMessage,
      logs: [...state.logs, `Error: No operation found at step ${stepIndex}`]
    }
  }

  const totalSteps = state.operationChain?.length || 1
  const stepNumber = stepIndex + 1
  
  console.log(`⚡ Executing step ${stepNumber}/${totalSteps}: ${currentStep.operation}`)

  // Emit operation start event
  if (emitter) {
    await emitter.emitOperationStart(
      currentStep.operation,
      stepNumber,
      totalSteps,
      currentStep.description
    )
  }

  // Update state for current operation
  const stepState = {
    ...state,
    operation: currentStep.operation,
    fileOperationType: currentStep.fileOperationType,
    currentStep: stepIndex
  }

  try {
    let result: DocumentProcessingState

    // Execute the appropriate handler
    switch (currentStep.operation) {
      case 'summary':
        result = await handleSummaryNode(stepState, emitter)
        break
      case 'file_operation':
        result = await handleFileOperationNode(stepState, emitter)
        break
      case 'analysis':
        result = await handleAnalysisNode(stepState, emitter)
        break
      case 'extraction':
        result = await handleExtractionNode(stepState, emitter)
        break
      case 'transformation':
        result = await handleTransformationNode(stepState, emitter)
        break
      case 'qa':
      default:
        result = await handleQANode(stepState, emitter)
        break
    }

    // Emit operation complete event if successful
    if (emitter && !result.error) {
      await emitter.emitOperationComplete(
        currentStep.operation,
        stepNumber,
        totalSteps,
        result.result
      )
    }

    return result
  } catch (error) {
    const errorMessage = `Operation ${currentStep.operation} failed: ${error}`
    if (emitter) {
      await emitter.emitError(errorMessage, stepNumber, currentStep.operation)
    }
    
    return {
      ...stepState,
      error: errorMessage,
      logs: [...stepState.logs, `Step ${stepNumber} error: ${error}`]
    }
  }
}

// Enhanced workflow that supports both single operations and operation chains with SSE
const executeDocumentProcessingFlow = async (
  initialState: DocumentProcessingState, 
  emitter?: ProgressEmitter
): Promise<DocumentProcessingState> => {
  const startTime = Date.now()
  console.log("🚀 Starting enhanced document processing workflow")
  
  try {
    // Emit started event
    if (emitter) {
      await emitter.emitStarted()
    }
    
    // Step 1: Classify operation (now supports chains)
    console.log("🎯 Step 1: Classifying operation(s)")
    let state = await classifyOperationNode(initialState, emitter)
    if (state.error) return state
    
    // Step 2: Fetch files
    console.log("📁 Step 2: Fetching relevant files")
    const fetchResult = await fetchFilesNode(state, emitter)
    if (fetchResult.error) return fetchResult
    // @ts-ignore - Type compatibility issue with optional error field
    state = fetchResult
    
    // Step 3: Execute operation chain
    const operationChain = state.operationChain || []
    const isChain = operationChain.length > 1
    
    if (isChain) {
      console.log(`🔗 Step 3: Executing operation chain with ${operationChain.length} steps`)
      
      // Execute each operation in sequence
      for (let i = 0; i < operationChain.length; i++) {
        console.log(`📋 Step 3.${i + 1}: ${operationChain[i].operation} - ${operationChain[i].description || 'No description'}`)
        
        const stepResult = await executeOperationStep(state, i, emitter)
        if (stepResult.error) return stepResult
        // @ts-ignore - Type compatibility issue with operation chaining
        state = stepResult
        
        // Store intermediate result if not the final step
        if (i < operationChain.length - 1 && state.result) {
          state.intermediateResults = [...(state.intermediateResults || []), state.result]
          
          // Emit intermediate result event
          if (emitter) {
            await emitter.emitIntermediateResult(
              state.result,
              i + 1,
              operationChain.length,
              operationChain[i].operation
            )
          }
          
          // For next step, use previous result as context
          const contextPrompt = `Previous step result: ${state.result}\n\nOriginal request: ${initialState.userPrompt}`
          state = {
            ...state,
            userPrompt: contextPrompt,
            result: undefined // Clear result for next step
          }
          
          console.log(`✅ Step 3.${i + 1} completed, result stored as intermediate`)
        }
      }
      
      console.log("✅ Operation chain completed successfully")
    } else {
      console.log(`⚡ Step 3: Executing single operation: ${state.operation}`)
      const singleResult = await executeOperationStep(state, 0, emitter)
      // @ts-ignore - Type compatibility issue with single operation
      state = singleResult
    }
    
    // Emit final result and completion events
    if (emitter && state.result) {
      await emitter.emitFinalResult(state.result, operationChain.length)
      
      const processingTime = (Date.now() - startTime) / 1000
      await emitter.emitComplete(processingTime, operationChain.length, isChain)
    }
    
    console.log("✅ Workflow completed successfully")
    return state
  } catch (error) {
    console.error("❌ Workflow execution failed:", error)
    const errorMessage = `Workflow execution failed: ${error}`
    
    if (emitter) {
      await emitter.emitError(errorMessage)
    }
    
    return {
      ...initialState,
      error: errorMessage,
      logs: [...initialState.logs, `Workflow error: ${error}`]
    }
  }
}

// Generate text file from processing results
const generateTextFile = (result: string, userPrompt: string, timestamp: string) => {
  return `DOCUMENT PROCESSING RESULT
Generated: ${timestamp}
User Request: ${userPrompt}

RESULT:
${result}

--- END OF PROCESSING RESULT ---`
}

// Main POST handler using proper LangGraph
export const POST = async (request: NextRequest): Promise<NextResponse<ProcessingResponse>> => {
  console.log("🚀 Starting LangGraph document processing workflow")
  
  try {
    const requestId = `processing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const body: ProcessingRequest = await request.json()
    const { userPrompt, searchQuery } = body

    if (!userPrompt) {
      return NextResponse.json({
        success: false,
        error: 'User prompt is required'
      }, { status: 400 })
    }

    // Create initial state
    const initialState: DocumentProcessingState = {
      userPrompt,
      searchQuery,
      processedFiles: [],
      logs: [`Starting document processing for: ${userPrompt}`],
      requestId,
      metadata: {}
    }

    // Execute the workflow (without SSE for REST endpoint)
    console.log("📋 Executing document processing workflow")
    const finalState = await executeDocumentProcessingFlow(initialState)
    console.log("✅ Workflow completed")

    // Check for errors
    if (finalState.error) {
      console.error("❌ Workflow failed with error:", finalState.error)
      return NextResponse.json({
        success: false,
        error: finalState.error as string,
        logs: finalState.logs as string[]
      }, { status: 500 })
    }

    // Generate text file if we have a result
    let generatedFile: string | undefined
    let fileName: string | undefined

    if (finalState.result) {
      const timestamp = new Date().toISOString()
      generatedFile = generateTextFile(finalState.result as string, userPrompt, timestamp)
      fileName = `processing_result_${Date.now()}.txt`
    }

    console.log("📄 Sending successful response with", (finalState.processedFiles as ProcessedFileInfo[]).length, "processed files")

    const isChain = (finalState.operationChain?.length || 0) > 1
    const completedSteps = finalState.currentStep !== undefined ? finalState.currentStep + 1 : finalState.operationChain?.length || 1

    return NextResponse.json({
      success: true,
      result: finalState.result as string,
      generatedFile,
      fileName,
      logs: finalState.logs as string[],
      processedFiles: finalState.processedFiles as ProcessedFileInfo[],
      confidence: finalState.confidence as number,
      metadata: finalState.metadata as Record<string, any>,
      operation: finalState.operation as string,
      // Operation chain information
      operationChain: finalState.operationChain,
      intermediateResults: finalState.intermediateResults,
      isChain,
      totalSteps: finalState.operationChain?.length || 1,
      completedSteps
    })

  } catch (error) {
    console.error('❌ LangGraph document processing error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during document processing'
    }, { status: 500 })
  }
}

// SSE Endpoint for Real-time Progress Updates
export const GET = async (request: NextRequest): Promise<Response> => {
  console.log("🚀 Starting SSE document processing stream")
  
  const url = new URL(request.url)
  const userPrompt = url.searchParams.get('userPrompt')
  const searchQuery = url.searchParams.get('searchQuery')

  if (!userPrompt) {
    return new Response('User prompt is required', { status: 400 })
  }

  // Create readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      let isControllerClosed = false
      
      const safeEnqueue = (data: Uint8Array) => {
        if (!isControllerClosed) {
          try {
            controller.enqueue(data)
          } catch (error) {
            console.error('Error enqueueing data:', error)
            isControllerClosed = true
          }
        }
      }

      const safeClose = () => {
        if (!isControllerClosed) {
          try {
            controller.close()
            isControllerClosed = true
          } catch (error) {
            console.error('Error closing controller:', error)
            isControllerClosed = true
          }
        }
      }

      const processWithSSE = async () => {
        let emitter: ProgressEmitter | null = null
        
        try {
          const requestId = `sse-processing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          
          // Create custom writer that uses the controller safely
          const customWriter = {
            write: async (chunk: Uint8Array) => {
              safeEnqueue(chunk)
            },
            close: async () => {
              safeClose()
            }
          }
          
          emitter = new ProgressEmitter(customWriter as WritableStreamDefaultWriter<Uint8Array>, requestId)

          // Send initial connection event
          safeEnqueue(new TextEncoder().encode(`data: ${JSON.stringify({
            type: 'connection',
            message: 'Real-time connection established',
            timestamp: new Date().toISOString()
          })}\n\n`))

          // Create initial state
          const initialState: DocumentProcessingState = {
            userPrompt,
            searchQuery: searchQuery || undefined,
            processedFiles: [],
            logs: [`Starting SSE document processing for: ${userPrompt}`],
            requestId,
            metadata: {}
          }

          // Execute the workflow with progress emission
          console.log("📋 Executing SSE document processing workflow")
          const finalState = await executeDocumentProcessingFlow(initialState, emitter)

          // Send final completion data only if stream is still open
          if (!emitter.isStreamClosed() && !isControllerClosed) {
            if (finalState.error) {
              await emitter.emitError(finalState.error)
            } else {
              // Send final result summary
              safeEnqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'final_summary',
                message: 'Processing completed successfully',
                timestamp: new Date().toISOString(),
                data: {
                  success: true,
                  operationChain: finalState.operationChain,
                  totalSteps: finalState.operationChain?.length || 1,
                  processedFiles: finalState.processedFiles?.length || 0,
                  confidence: finalState.confidence,
                  isChain: (finalState.operationChain?.length || 0) > 1
                }
              })}\n\n`))
            }
          }

        } catch (error) {
          console.error('❌ SSE processing error:', error)
          
          // Send error event only if stream is still open
          if (!isControllerClosed) {
            const errorEvent = `data: ${JSON.stringify({
              type: 'error',
              message: `Processing failed: ${error}`,
              timestamp: new Date().toISOString(),
              error: String(error)
            })}\n\n`
            
            safeEnqueue(new TextEncoder().encode(errorEvent))
          }
        } finally {
          // Close emitter and controller
          if (emitter) {
            await emitter.close()
          }
          safeClose()
        }
      }

      // Start processing
      processWithSSE()
    },

    cancel() {
      console.log("Client disconnected from SSE stream")
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}
