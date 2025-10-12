import { NextRequest, NextResponse } from 'next/server'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { OpenRouterService, ChatType } from '../../lib/openRouterService'

interface LegalAnalysisRequest {
  userIssue: string
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
    const { userIssue } = body
    
    console.log('Request parsed:', { userIssue: userIssue.substring(0, 50) + '...' })

    // Step 1: Analyze the question and generate appropriate response structure
    console.log('Generating legal analysis response...')
    
    const analysisPrompt = `${userIssue}`

    // Create LangChain messages for the legal analysis
    const messages = [
      new SystemMessage(`You are a professional legal advisor assistant. Provide clear, accurate legal information in a conversational manner.

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

**Remember:** You're having a conversation, not writing a formal legal document. Be helpful, clear, and appropriately concise.`),
      new HumanMessage(analysisPrompt)
    ]

    console.log('Calling OpenRouter with LangChain for legal analysis (streaming)...')
    
    // Create a TransformStream to handle the streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
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

          // Send completion signal with token usage
          const completion = {
            type: 'done',
            success: true,
            tokensUsed: tokenUsage.totalTokens
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completion)}\n\n`))
          
          console.log('OpenRouter streaming response completed:', {
            contentLength: fullContent.length,
            tokensUsed: tokenUsage.totalTokens
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
