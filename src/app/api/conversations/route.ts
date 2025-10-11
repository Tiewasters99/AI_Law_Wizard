import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get all conversations for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isAttorney = currentUser.role === 'ATTORNEY' || currentUser.role === 'LAWYER'

    // Fetch conversations based on role
    const conversations = await prisma.conversation.findMany({
      where: isAttorney ? {
        attorneyId: session.user.id
      } : {
        clientId: session.user.id
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            customerProfile: {
              select: {
                companyName: true
              }
            }
          }
        },
        attorney: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            lawyerProfile: {
              select: {
                firmName: true,
                specialty: true
              }
            }
          }
        },
        consultationRequest: {
          select: {
            id: true,
            caseType: true,
            status: true,
            urgency: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            isRead: true
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    })

    // Format conversations with last message and unread count
    const formattedConversations = conversations.map(conversation => {
      const unreadCount = isAttorney ? conversation.unreadByAttorney : conversation.unreadByClient
      const lastMessage = conversation.messages[0] || null
      const otherParty = isAttorney ? conversation.client : conversation.attorney

      return {
        id: conversation.id,
        consultationRequestId: conversation.consultationRequestId,
        otherParty,
        consultationRequest: conversation.consultationRequest,
        lastMessage,
        unreadCount,
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt
      }
    })

    return NextResponse.json({ 
      success: true,
      conversations: formattedConversations
    })

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

