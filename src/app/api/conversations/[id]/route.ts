import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get conversation details with all messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            customerProfile: {
              select: {
                companyName: true,
                industry: true
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
                specialty: true,
                yearsOfExperience: true,
                verified: true
              }
            }
          }
        },
        consultationRequest: {
          select: {
            id: true,
            caseType: true,
            description: true,
            urgency: true,
            status: true,
            createdAt: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'asc'
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
      select: { role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isAttorney = currentUser.role === 'ATTORNEY' || currentUser.role === 'LAWYER'

    // Mark messages as read for current user
    await prisma.$transaction(async (tx) => {
      // Mark all unread messages as read
      await tx.message.updateMany({
        where: {
          conversationId: id,
          senderId: { not: session.user.id },
          isRead: false
        },
        data: {
          isRead: true
        }
      })

      // Reset unread counter for current user
      if (isAttorney) {
        await tx.conversation.update({
          where: { id },
          data: { unreadByAttorney: 0 }
        })
      } else {
        await tx.conversation.update({
          where: { id },
          data: { unreadByClient: 0 }
        })
      }
    })

    return NextResponse.json({ 
      success: true,
      conversation
    })

  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}

