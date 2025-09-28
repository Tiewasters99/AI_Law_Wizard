import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ChatService } from '@/app/lib/chatService'

// GET /api/chat/sessions/[id] - Get chat history for a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const { id: sessionId } = await params
    const sessionWithHistory = await ChatService.getSessionWithHistory(sessionId)
    
    return NextResponse.json(sessionWithHistory)
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
}

// DELETE /api/chat/sessions/[id] - Delete a chat session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sessionId } = await params
    await ChatService.deleteSession(sessionId, userId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chat session:', error)
    return NextResponse.json(
      { error: 'Failed to delete chat session' },
      { status: 500 }
    )
  }
}
