import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ChatService } from '@/app/lib/chatService'

interface ChatRequest {
  message: string
  sessionId?: string
  chatType?: 'general' | 'apprentice' | 'wizard' | 'grand-wizard'
}

export async function POST(request: NextRequest) {
  try {
    console.log('Chat API called - checking environment...')
    
    // Check if OpenRouter API key is available
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY is not set in environment variables')
      return NextResponse.json(
        { error: 'API key not configured. Please set OPENROUTER_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    console.log('API key found, parsing request body...')
    const body: ChatRequest = await request.json()
    const { message, sessionId, chatType = 'general' } = body
    
    console.log('Request parsed:', { 
      message: message.substring(0, 50) + '...', 
      sessionId, 
      chatType,
      userId: userId ? 'authenticated' : 'anonymous'
    })

    // For apprentice tier, allow anonymous users to use chat
    // For other tiers, require authentication
    if (chatType !== 'apprentice' && !userId) {
      return NextResponse.json(
        { error: 'Authentication required for this chat type' },
        { status: 401 }
      )
    }

    let currentSessionId = sessionId
    let isNewSession = false

    // Create new session if none provided
    if (!currentSessionId) {
      currentSessionId = await ChatService.createSession(userId, undefined, chatType)
      isNewSession = true
      console.log('Created new session:', currentSessionId)
    } else {
      console.log('Using existing session:', currentSessionId)
    }

    // Update session title if it's a new session
    if (isNewSession) {
      await ChatService.updateSessionTitle(currentSessionId, message)
    }

    // Send message and get response using ChatService
    const result = await ChatService.sendMessage(currentSessionId, message, userId, chatType)
    
    console.log('Response generated successfully')

    return NextResponse.json({ 
      response: result.response,
      sessionId: currentSessionId,
      tokenCount: result.tokenCount
    })
  } catch (error) {
    console.error('Chat API error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
