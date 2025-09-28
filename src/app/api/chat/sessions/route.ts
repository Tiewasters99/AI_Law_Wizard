import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ChatService } from '@/app/lib/chatService'

// GET /api/chat/sessions - Get user's chat sessions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const sessions = await ChatService.getUserSessions(userId, limit)
    
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Error fetching chat sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    )
  }
}

// POST /api/chat/sessions - Create a new chat session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const body = await request.json()
    const { title, chatType } = body

    const sessionId = await ChatService.createSession(userId, title, chatType)
    
    return NextResponse.json({ sessionId })
  } catch (error) {
    console.error('Error creating chat session:', error)
    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    )
  }
}
