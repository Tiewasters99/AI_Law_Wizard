import { NextRequest, NextResponse } from 'next/server'
import { ChatXAI } from '@langchain/xai'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from '@langchain/core/messages'
import { BufferMemory } from 'langchain/memory'
import { ConversationChain } from 'langchain/chains'
import { prisma } from '../../../../lib/prisma'
import { searchRelevant } from '../../../lib/retrival'
import { openapi, pineIndex } from '../../../lib/pineConfig'

interface ChatRequest {
  message: string
  sessionId: string
  mode: 'qa' | 'action'
}

interface ChatResponse {
  success: boolean
  message?: string
  metadata?: any
  error?: string
}

// Initialize AI models
const grok = new ChatXAI({
  apiKey: process.env.GROK_API_KEY!,
  model: 'grok-4-latest',
  maxTokens: 4000,
  temperature: 0.3
})

const openai = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4o-mini',
  maxTokens: 2000,
  temperature: 0.3
})

// Vector search function for chat context
const searchVectorDatabaseForChat = async (
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
    console.log(`🔍 Searching vector database for chat: ${query}`)
    
    // Create embedding for the query
    const queryEmbedding = await openapi.embedQuery(query)
    
    // Search across ALL chunks without job filtering
    const searchResults = await pineIndex.query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true,
      includeValues: false
    })
    
    if (!searchResults.matches || searchResults.matches.length === 0) {
      console.log(`⚠️ No vector search results found`)
      return []
    }

    // Get database chunks using embeddingId to find jobId and summaries
    const embeddingIds = searchResults.matches.map((match: any) => match.id)
    
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

    // Get job information for the found chunks
    const jobIds = [...new Set(databaseChunks.map(chunk => chunk.jobId))]
    
    const jobs = await prisma.embeddingJob.findMany({
      where: { 
        id: { in: jobIds },
        status: 'COMPLETED' 
      },
      select: { id: true, fileName: true }
    })
    
    const jobMap = new Map(jobs.map(job => [job.id, job.fileName]))

    // Create mapping from embeddingId to database chunk
    const chunkMap = new Map(
      databaseChunks.map(chunk => [chunk.embeddingId, chunk])
    )

    // Combine vector results with database chunk info and job info
    const enrichedResults = searchResults.matches
      .map((match: any) => {
        const databaseChunk = chunkMap.get(match.id)
        const jobFileName = databaseChunk ? jobMap.get(databaseChunk.jobId) : null
        
        return {
          id: match.id,
          content: match.metadata?.text || '',
          summary: databaseChunk?.summary || 'No summary available',
          metadata: databaseChunk?.metadata || match.metadata || {},
          chunkIndex: match.metadata?.chunkIndex || 0,
          relevanceScore: match.score || 0,
          jobId: databaseChunk?.jobId || 'unknown',
          jobFileName: jobFileName || `Document ${databaseChunk?.jobId || 'unknown'}`
        }
      })
      .filter(result => result.jobId !== 'unknown')
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)

    console.log(`✅ Vector search found ${enrichedResults.length} relevant chunks`)
    return enrichedResults

  } catch (error) {
    console.error('❌ Error in vector search for chat:', error)
    return []
  }
}

// POST - Send message and get AI response with proper LangChain integration
export const POST = async (request: NextRequest): Promise<NextResponse<ChatResponse>> => {
  try {
    const body: ChatRequest = await request.json()
    const { message, sessionId, mode } = body

    if (!message || !sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Message and session ID are required'
      }, { status: 400 })
    }

    console.log(`💬 Processing chat message for session ${sessionId}`)

    // Get session details with full context
    const session = await prisma.documentAnalysisSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        fileContexts: {
          orderBy: { lastAccessed: 'desc' }
        }
      }
    })

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found'
      }, { status: 404 })
    }

    // Save user message first
    const userMessage = await prisma.documentAnalysisMessage.create({
      data: {
        sessionId,
        role: 'USER',
        content: message,
        metadata: {
          timestamp: new Date().toISOString(),
          mode
        }
      }
    })

    console.log(`💾 Saved user message: ${message.substring(0, 50)}...`)

    // Get session context
    const sessionContext = session.context as any || {}
    const originalQuery = sessionContext.originalQuery || ''
    const analysisResult = sessionContext.analysisResult || ''
    const processedFiles = sessionContext.processedFiles || []

    console.log(`📋 Session context - Original query: ${originalQuery.substring(0, 50)}...`)

    // Search for relevant content using the same vector search as main processing
    let relevantContent = ''
    let searchResults: any[] = []
    
    try {
      console.log(`🔍 Searching for relevant content for: ${message}`)
      searchResults = await searchVectorDatabaseForChat(message, 5)
      
      if (searchResults && searchResults.length > 0) {
        relevantContent = searchResults.map((chunk: any) => {
          return `Document: ${chunk.jobFileName || 'Unknown'}\nContent: ${chunk.content}\nRelevance: ${chunk.relevanceScore}\n---\n`
        }).join('\n')
        console.log(`✅ Found ${searchResults.length} relevant chunks`)
      } else {
        console.log(`⚠️ No relevant content found for query`)
      }
    } catch (searchError) {
      console.warn('⚠️ Vector search failed, trying fallback search:', searchError)
      try {
        const fallbackResults = await searchRelevant(message, 3)
        if (fallbackResults && fallbackResults.length > 0) {
          relevantContent = fallbackResults.map((chunk: any) => {
            const metadata = chunk.metadata || {}
            return `Document: ${metadata.fileName || 'Unknown'}\nContent: ${chunk.pageContent}\n---\n`
          }).join('\n')
          console.log(`✅ Fallback search found content`)
        }
      } catch (fallbackError) {
        console.warn('⚠️ Fallback search also failed:', fallbackError)
      }
    }

    // Build conversation history with proper LangChain messages
    const recentMessages = session.messages.slice(-10) // Keep last 10 messages for richer context
    const messageHistory: BaseMessage[] = recentMessages.map(msg => {
      if (msg.role === 'USER') {
        return new HumanMessage(msg.content)
      } else {
        return new AIMessage(msg.content)
      }
    })

    // Create comprehensive system prompt with full context maintenance
    const systemPrompt = `You are an expert document analysis assistant with access to the complete context of a previous analysis.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ORIGINAL ANALYSIS CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**User's Original Question:**
"${originalQuery}"

**Analysis Result Summary:**
${analysisResult.substring(0, 1500)}${analysisResult.length > 1500 ? '...' : ''}

**Files Analyzed:** ${processedFiles.length} document${processedFiles.length !== 1 ? 's' : ''}
${processedFiles.length > 0 ? `\n**Document Names:** ${processedFiles.slice(0, 5).map((f: any) => f.fileName || f.originalName).join(', ')}${processedFiles.length > 5 ? '...' : ''}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 RELEVANT DOCUMENT CONTENT FOR THIS QUERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${relevantContent || 'No additional document content found for this specific query. Use the original analysis context above.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 YOUR ROLE AND INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are continuing a conversation about a document analysis. The user has already received an initial analysis and is now asking follow-up questions.

**Core Principles:**
1. **Maintain Full Context**: Always reference the original query and analysis when relevant
2. **Use Document Content**: When available, cite specific documents and their content
3. **Be Conversational**: Respond naturally as if continuing a discussion
4. **Stay Focused**: Keep answers relevant to the document analysis topic
5. **Be Accurate**: Only provide information from the analysis or document content
6. **Be Helpful**: Offer additional insights or clarifications proactively

**Response Guidelines:**
- Reference specific parts of the original analysis when answering
- If the question relates to something in the original analysis, cite it
- If the question asks about new information, use the relevant document content provided
- If information is not available in either the analysis or documents, clearly state that
- Maintain consistency with previous responses in this conversation
- Use markdown formatting for better readability

Remember: You have the complete context of the analysis, the documents, and the conversation history. Use all of this to provide comprehensive, contextually-aware answers.`

    // Prepare messages for AI with proper LangChain structure
    const messages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      ...messageHistory,
      new HumanMessage(message)
    ]

    console.log(`🤖 Sending ${messages.length} messages to AI model (${messageHistory.length} history messages)`)

    // Get AI response using appropriate model
    const startTime = Date.now()
    let aiResponse: string
    let modelUsed: string

    try {
      if (mode === 'action') {
        console.log(`🚀 Using Grok for action-oriented response`)
        const response = await grok.invoke(messages)
        aiResponse = response.content as string
        modelUsed = 'grok-4-latest'
      } else {
        console.log(`🚀 Using GPT-4o-mini for Q&A response`)
        const response = await openai.invoke(messages)
        aiResponse = response.content as string
        modelUsed = 'gpt-4o-mini'
      }

      const processingTime = Date.now() - startTime
      console.log(`✅ AI response generated in ${processingTime}ms using ${modelUsed}`)

      // Save AI response to database
      const aiMessage = await prisma.documentAnalysisMessage.create({
        data: {
          sessionId,
          role: 'ASSISTANT',
          content: aiResponse,
          metadata: {
            timestamp: new Date().toISOString(),
            mode,
            processingTime,
            relevantContent: !!relevantContent,
            searchResults: searchResults.length,
            modelUsed
          },
          tokenCount: Math.ceil((message.length + aiResponse.length) / 4),
          modelUsed
        }
      })

      // Update session with enhanced context tracking
      await prisma.documentAnalysisSession.update({
        where: { id: sessionId },
        data: { 
          updatedAt: new Date(),
          context: {
            ...sessionContext,
            lastMessage: message,
            lastResponse: aiResponse,
            totalMessages: session.messages.length + 2,
            lastUpdated: new Date().toISOString(),
            // Maintain original context
            originalQuery: sessionContext.originalQuery || originalQuery,
            analysisResult: sessionContext.analysisResult || analysisResult,
            processedFiles: sessionContext.processedFiles || processedFiles,
            // Track conversation flow
            conversationTopics: [
              ...(sessionContext.conversationTopics || []),
              message.substring(0, 100) // Track user questions
            ].slice(-10), // Keep last 10 topics
            // Track search patterns
            searchesPerformed: (sessionContext.searchesPerformed || 0) + 1,
            documentsReferenced: [
              ...(sessionContext.documentsReferenced || []),
              ...searchResults.map(r => r.jobId)
            ].filter((v, i, a) => a.indexOf(v) === i) // Unique document IDs
          }
        }
      })

      console.log(`📊 Session context updated - Total messages: ${session.messages.length + 2}, Searches: ${(sessionContext.searchesPerformed || 0) + 1}`)

      // Update file contexts if relevant files were found
      if (searchResults.length > 0) {
        for (const result of searchResults) {
          // Check if file context already exists
          const existingContext = await prisma.fileContext.findFirst({
            where: {
              sessionId: sessionId,
              fileId: result.jobId
            }
          })

          if (existingContext) {
            // Update existing context
            await prisma.fileContext.update({
              where: { id: existingContext.id },
              data: {
                lastAccessed: new Date(),
                relevanceScore: result.relevanceScore
              }
            })
          } else {
            // Create new context
            await prisma.fileContext.create({
              data: {
                sessionId: sessionId,
                fileId: result.jobId,
                fileName: result.jobFileName || 'Unknown',
                chunksUsed: [result.chunkIndex],
                relevanceScore: result.relevanceScore,
                lastAccessed: new Date()
              }
            })
          }
        }
        console.log(`📁 Updated file contexts for ${searchResults.length} files`)
      }

      return NextResponse.json({
        success: true,
        message: aiResponse,
        metadata: {
          processingTime,
          modelUsed,
          sessionId,
          messageId: aiMessage.id,
          relevantContent: !!relevantContent,
          searchResults: searchResults.length
        }
      })

    } catch (aiError) {
      console.error('❌ AI model error:', aiError)
      
      // Save error message
      const errorMessage = await prisma.documentAnalysisMessage.create({
        data: {
          sessionId,
          role: 'ASSISTANT',
          content: 'I apologize, but I encountered an error while processing your request. Please try again.',
          metadata: {
            timestamp: new Date().toISOString(),
            mode,
            error: aiError instanceof Error ? aiError.message : 'Unknown AI error'
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'I apologize, but I encountered an error while processing your request. Please try again.',
        metadata: {
          processingTime: Date.now() - startTime,
          modelUsed: 'error',
          sessionId,
          messageId: errorMessage.id,
          error: true
        }
      })
    }

  } catch (error) {
    console.error('❌ Error in chat API:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process chat message'
    }, { status: 500 })
  }
}

// GET - Get chat history for a session
export const GET = async (request: NextRequest): Promise<NextResponse<ChatResponse>> => {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 })
    }

    const messages = await prisma.documentAnalysisMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({
      success: true,
      metadata: {
        messages: messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          metadata: msg.metadata,
          tokenCount: msg.tokenCount,
          modelUsed: msg.modelUsed,
          createdAt: msg.createdAt
        }))
      }
    })

  } catch (error) {
    console.error('❌ Error fetching chat history:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch chat history'
    }, { status: 500 })
  }
}
