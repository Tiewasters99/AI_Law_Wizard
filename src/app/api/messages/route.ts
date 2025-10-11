import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Send message in conversation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId, content, attachments } = await request.json()

    // Validation
    if (!conversationId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 })
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Message content is too long (max 2000 characters)' }, { status: 400 })
    }

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        attorney: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Check if user is part of this conversation
    if (
      conversation.clientId !== session.user.id &&
      conversation.attorneyId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get current user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isAttorney = currentUser.role === 'ATTORNEY' || currentUser.role === 'LAWYER'
    const recipientId = isAttorney ? conversation.clientId : conversation.attorneyId
    const recipientName = isAttorney ? conversation.client.name : conversation.attorney.name

    // Create message, update conversation, and create notification in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create message
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId: session.user.id,
          content: content.trim(),
          attachments: attachments || null
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      })

      // Update conversation
      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          unreadByClient: isAttorney ? { increment: 1 } : undefined,
          unreadByAttorney: !isAttorney ? { increment: 1 } : undefined
        }
      })

      // Create notification for recipient
      await tx.notification.create({
        data: {
          userId: recipientId,
          type: 'MESSAGE_RECEIVED',
          title: 'New Message',
          message: `${currentUser.name} sent you a message`,
          relatedId: conversationId
        }
      })

      return message
    })

    return NextResponse.json({ 
      success: true,
      message: result
    }, { status: 201 })

  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

