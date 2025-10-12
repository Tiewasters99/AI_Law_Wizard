import { NextRequest, NextResponse } from 'next/server'
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from '@langchain/core/messages'
import { OpenRouterService, ChatType } from '../../lib/openRouterService'
import { ChatService } from '../../lib/chatService'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

interface LegalAnalysisRequest {
  userIssue: string
  sessionId?: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('Legal Analysis API called - checking environment...')
    
    // Debug: Check if OpenRouter API key is available
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY is not set in environment variables')
      return NextResponse.json(
        { error: 'API key not configured. Please set OPENROUTER_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    console.log('API key found, parsing request body...')
    const body: LegalAnalysisRequest = await request.json()
    const { userIssue, sessionId } = body
    
    // Get user session for authentication (optional - allow anonymous users)
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    
    console.log('Request parsed:', { 
      userIssue: userIssue.substring(0, 50) + '...', 
      sessionId,
      userId: userId ? 'authenticated' : 'anonymous'
    })

    // Step 1: Manage chat session (works for both authenticated and anonymous users)
    let currentSessionId = sessionId
    let isNewSession = false

    // Create new session if none provided (userId can be undefined for anonymous users)
    if (!currentSessionId) {
      currentSessionId = await ChatService.createSession(userId, undefined, 'wizard')
      isNewSession = true
      console.log('Created new chat session:', currentSessionId, userId ? '(authenticated)' : '(anonymous)')
    } else {
      console.log('Using existing session:', currentSessionId)
    }

    // Update session title if it's a new session
    if (isNewSession) {
      await ChatService.updateSessionTitle(currentSessionId, userIssue)
    }

    // Step 2: Get conversation history from database
    const { session: chatSession, messages: chatHistory } = await ChatService.getSessionWithHistory(currentSessionId)
    console.log(`Retrieved ${chatHistory.length} previous messages from session`)

    // Step 3: Convert database messages to LangChain format
    const messageHistory: BaseMessage[] = chatHistory.map(msg => {
      if (msg.role === 'USER') {
        return new HumanMessage(msg.content)
      } else if (msg.role === 'ASSISTANT') {
        return new AIMessage(msg.content)
      } else {
        return new SystemMessage(msg.content)
      }
    })

    // Step 4: Create system prompt
    const systemPrompt = `You are a professional legal advisor assistant. Provide clear, accurate legal information in a conversational manner.

**Your approach:**
- Answer questions directly and concisely, like ChatGPT or Gemini
- Only provide detailed explanations when the user specifically asks for them
- Be conversational and natural, not overly formal or structured
- Use markdown formatting for clarity (bold, lists, etc.) when helpful
- Match the length and depth to what the user is asking for
- If the question is simple, keep the answer brief
- If the question asks for detailed analysis, provide comprehensive information
- Always include brief legal disclaimers when giving legal advice
- DO NOT use emojis
- Cite relevant laws, statutes, or legal principles when applicable

**Context Awareness:**
- You have access to the full conversation history
- Reference previous questions and answers when relevant
- Maintain consistency with earlier advice given
- If the user refers to something from earlier in the conversation, acknowledge it

**Remember:** You're having a conversation, not writing a formal legal document. Be helpful, clear, and appropriately concise.`

    // Step 5: Build complete message array with history
    const messages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      ...messageHistory,
      new HumanMessage(userIssue)
    ]

    console.log(`Calling OpenRouter with ${messages.length} messages (${messageHistory.length} history messages, streaming)...`)
    
    // Create a TransformStream to handle the streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Step 6: Save user message to database before streaming
          await prisma.chatMessage.create({
            data: {
              sessionId: currentSessionId,
              role: 'USER',
              content: userIssue,
              metadata: {
                timestamp: new Date().toISOString()
              }
            }
          }).catch(err => console.error('Error saving user message:', err))

          // Stream the content and track tokens
          let fullContent = ''
          let tokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
          
          for await (const chunk of OpenRouterService.sendStreamingMessage(messages, 'wizard' as ChatType)) {
            if (chunk.type === 'content' && chunk.content) {
              fullContent += chunk.content
              const data = {
                type: 'content',
                content: chunk.content
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
            } else if (chunk.type === 'usage' && chunk.usage) {
              tokenUsage = chunk.usage
            }
          }

          // Step 7: Save AI response to database after streaming completes
          await prisma.chatMessage.create({
            data: {
              sessionId: currentSessionId,
              role: 'ASSISTANT',
              content: fullContent,
              metadata: {
                timestamp: new Date().toISOString(),
                modelUsed: 'wizard'
              },
              tokenCount: tokenUsage.totalTokens,
              modelUsed: 'wizard'
            }
          }).catch(err => console.error('Error saving AI response:', err))

          // Update session timestamp
          await prisma.chatSession.update({
            where: { id: currentSessionId },
            data: { updatedAt: new Date() }
          }).catch(err => console.error('Error updating session:', err))

          // Send completion signal with token usage and sessionId
          const completion = {
            type: 'done',
            success: true,
            tokensUsed: tokenUsage.totalTokens,
            sessionId: currentSessionId
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completion)}\n\n`))
          
          console.log('OpenRouter streaming response completed:', {
            contentLength: fullContent.length,
            tokensUsed: tokenUsage.totalTokens,
            sessionId: currentSessionId,
            historyMessages: messageHistory.length
          })

          controller.close()
        } catch (error) {
          console.error('Error during streaming:', error)
          const errorData = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Legal Analysis API error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Provide more specific error messages based on error type
    let errorMessage = 'Failed to process legal analysis request'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'API key not configured. Please set OPENROUTER_API_KEY in your environment variables.'
        statusCode = 500
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again later.'
        statusCode = 429
      } else if (error.message.includes('credits')) {
        errorMessage = 'No credits available. Please check your OpenRouter account.'
        statusCode = 402
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
