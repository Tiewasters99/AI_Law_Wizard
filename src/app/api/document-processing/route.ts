import { NextRequest, NextResponse } from 'next/server'
import { ChatXAI } from '@langchain/xai'
import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { searchRelevant } from '../../lib/retrival'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import mammoth from 'mammoth'
import { prisma } from '../../../lib/prisma'

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
}

interface ProcessedFileInfo {
  fileId: string
  fileName: string
  originalName: string
  contentLength: number
  fileSize: number
  url: string
}

interface OperationStep {
  operation: 'summary' | 'analysis' | 'qa'
  confidence?: number
}

// File processing tool
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
          content: metadata.text || ''
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
    description: "Search for relevant files based on a query",
    schema: z.object({
      query: z.string().describe("Search query to find relevant files"),
      limit: z.number().optional().describe("Maximum number of files to return")
    })
  }
)

// Content extraction tool
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


// Main document processing function with LLM-driven tool selection
const processDocuments = async (request: ProcessingRequest): Promise<ProcessingResponse> => {
  const startTime = Date.now()
  let queryId: string | null = null
  
  try {
    console.log("🚀 Starting LLM-driven document processing")

    // Create LLM with tool access
    const grok = new ChatXAI({
      apiKey: process.env.GROK_API_KEY,
      model: 'grok-4',
      maxTokens: 4000,
      temperature: 0.3
    })

    // Bind tools to the LLM
    const llmWithTools = grok.bindTools([fileProcessingTool, contentExtractionTool])

    // System prompt for tool-enabled LLM
    const systemPrompt = `You are a document processing assistant. You have access to tools that can:
1. file_processing_tool - Search for relevant documents based on queries
2. content_extraction_tool - Extract content from specific files

Use these tools as needed to fulfill the user's request. After using tools, provide your final response directly to the user.`

    console.log("🤖 Processing user request with LLM tool selection")
    
    // Initial conversation with tool-enabled LLM
    let messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(request.userPrompt)
    ]

    const response = await llmWithTools.invoke(messages)
    let finalResponse = response
    let processedFiles: ProcessedFileInfo[] = []
    let toolCallCount = 0

    // Handle tool calls if any
    if (response.tool_calls && response.tool_calls.length > 0) {
      console.log(`🔧 LLM requested ${response.tool_calls.length} tool calls`)
      messages.push(response)

      // Execute each tool call
      for (const toolCall of response.tool_calls) {
        toolCallCount++
        console.log(`🔧 Executing tool: ${toolCall.name}`)
        
        try {
          let toolResult
          if (toolCall.name === 'file_processing_tool') {
            const args = toolCall.args as { query: string; limit?: number }
            toolResult = await fileProcessingTool.invoke(args)
            // Track processed files - check if result has the expected structure
            if (toolResult && typeof toolResult === 'object' && 'success' in toolResult && toolResult.success && 'files' in toolResult) {
              const files = (toolResult as any).files
              processedFiles.push(...files.map((file: any) => ({
                fileId: file.fileId,
                fileName: file.fileName,
                originalName: file.originalName,
                contentLength: file.content?.length || 0,
                fileSize: file.fileSize,
                url: file.url
              })))
            }
          } else if (toolCall.name === 'content_extraction_tool') {
            const args = toolCall.args as { fileUrl?: string; fileName: string; content?: string }
            toolResult = await contentExtractionTool.invoke(args)
          }

          // Add tool result to conversation
          messages.push(new ToolMessage({
            content: JSON.stringify(toolResult),
            tool_call_id: toolCall.id || 'tool_call'
          }))

        } catch (error) {
          console.error(`Error executing tool ${toolCall.name}:`, error)
          messages.push(new ToolMessage({
            content: JSON.stringify({ error: String(error) }),
            tool_call_id: toolCall.id || 'tool_call'
          }))
        }
      }

      // Get final response after tool execution
      console.log("🤖 Getting final response after tool execution")
      finalResponse = await llmWithTools.invoke(messages)
    }

    console.log("✅ Document processing completed successfully")

    // Save successful query to database
    const processingTime = Date.now() - startTime
    const toolsUsed = response.tool_calls?.map(tc => tc.name) || []
    
    try {
      const savedQuery = await prisma.documentQuery.create({
        data: {
          userQuery: request.userPrompt,
          aiResponse: finalResponse.content as string,
          searchQuery: request.searchQuery,
          success: true,
          confidence: 0.9,
          processingTime,
          totalSteps: toolCallCount + 1,
          completedSteps: toolCallCount + 1,
          toolsUsed,
          filesProcessed: processedFiles.length > 0 ? processedFiles as any : null
        }
      })
      queryId = savedQuery.id
      console.log(`💾 Query saved to database with ID: ${queryId}`)
    } catch (dbError) {
      console.error("❌ Failed to save query to database:", dbError)
      // Don't fail the main request if database save fails
    }

    return {
      success: true,
      result: finalResponse.content as string,
      processedFiles,
      confidence: 0.9,
      operationChain: [{ operation: 'summary', confidence: 0.9 }],
      totalSteps: toolCallCount + 1,
      completedSteps: toolCallCount + 1,
        queryId : queryId as string // Include the saved query ID in response
    }

  } catch (error) {
    console.error("❌ Document processing failed:", error)
    
    // Save failed query to database
    const processingTime = Date.now() - startTime
    try {
      const savedQuery = await prisma.documentQuery.create({
        data: {
          userQuery: request.userPrompt,
          aiResponse: "", // Empty response for failed queries
          searchQuery: request.searchQuery,
          success: false,
          error: String(error),
          processingTime,
          totalSteps: 1,
          completedSteps: 0,
          toolsUsed: []
        }
      })
      queryId = savedQuery.id
      console.log(`💾 Failed query saved to database with ID: ${queryId}`)
    } catch (dbError) {
      console.error("❌ Failed to save error to database:", dbError)
    }
    
    return {
      success: false,
      error: `Processing failed: ${error}`,
      queryId : queryId as string // Include the saved query ID in response
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