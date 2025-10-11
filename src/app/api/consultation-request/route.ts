import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Create new consultation request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { attorneyId, caseType, description, urgency, documents } = await request.json()

    // Validation
    if (!attorneyId || !caseType || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (description.length < 50 || description.length > 500) {
      return NextResponse.json({ error: 'Description must be between 50 and 500 characters' }, { status: 400 })
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        role: true, 
        freeConsultationRequestsUsed: true,
        maxFreeConsultationRequests: true,
        wallet: {
          select: {
            tokens: true
          }
        }
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is a customer
    if (currentUser.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Only customers can send consultation requests' }, { status: 403 })
    }

    // Check if attorney exists and has completed profile
    const attorney = await prisma.user.findUnique({
      where: { id: attorneyId },
      select: { 
        id: true, 
        role: true, 
        profileComplete: true 
      }
    })

    if (!attorney) {
      return NextResponse.json({ error: 'Attorney not found' }, { status: 404 })
    }

    if (attorney.role !== 'ATTORNEY' && attorney.role !== 'LAWYER') {
      return NextResponse.json({ error: 'Target user is not an attorney' }, { status: 400 })
    }

    if (!attorney.profileComplete) {
      return NextResponse.json({ error: 'Attorney profile is not complete' }, { status: 400 })
    }

    // Check if user has already sent a request to this attorney
    const existingRequest = await prisma.consultationRequest.findFirst({
      where: {
        clientId: currentUser.id,
        attorneyId: attorneyId,
        status: {
          in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS']
        }
      }
    })

    if (existingRequest) {
      return NextResponse.json({ error: 'You already have an active request with this attorney' }, { status: 400 })
    }

    // Check consultation request limit
    const hasTokens = currentUser.wallet && currentUser.wallet.tokens > 0
    const withinFreeLimit = currentUser.freeConsultationRequestsUsed < currentUser.maxFreeConsultationRequests

    if (!hasTokens && !withinFreeLimit) {
      return NextResponse.json({ 
        error: 'Free consultation request limit reached. Please purchase tokens to continue.',
        limitReached: true
      }, { status: 403 })
    }

    // Create consultation request and conversation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create consultation request
      const consultationRequest = await tx.consultationRequest.create({
        data: {
          clientId: currentUser.id,
          attorneyId: attorneyId,
          caseType,
          description,
          urgency: urgency || 'MEDIUM',
          documents: documents || null,
          status: 'PENDING'
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          attorney: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      })

      // Create conversation
      const conversation = await tx.conversation.create({
        data: {
          consultationRequestId: consultationRequest.id,
          clientId: currentUser.id,
          attorneyId: attorneyId
        }
      })

      // Increment free consultation requests used if user is on free tier
      if (!hasTokens) {
        await tx.user.update({
          where: { id: currentUser.id },
          data: {
            freeConsultationRequestsUsed: {
              increment: 1
            }
          }
        })
      }

      // Create notification for attorney
      await tx.notification.create({
        data: {
          userId: attorneyId,
          type: 'NEW_REQUEST',
          title: 'New Consultation Request',
          message: `${currentUser.id} sent you a new consultation request for ${caseType}`,
          relatedId: consultationRequest.id
        }
      })

      return { consultationRequest, conversation }
    })

    return NextResponse.json({ 
      success: true,
      consultationRequest: result.consultationRequest,
      conversationId: result.conversation.id
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating consultation request:', error)
    return NextResponse.json(
      { error: 'Failed to create consultation request' },
      { status: 500 }
    )
  }
}

// GET - Get consultation requests for current user
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

    // Fetch consultation requests based on role
    const consultationRequests = await prisma.consultationRequest.findMany({
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
                companyName: true,
                industry: true,
                phone: true
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
                specialty: true,
                firmName: true,
                yearsOfExperience: true
              }
            }
          }
        },
        conversation: {
          select: {
            id: true,
            unreadByClient: true,
            unreadByAttorney: true,
            lastMessageAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      success: true,
      consultationRequests,
      userRole: currentUser.role
    })

  } catch (error) {
    console.error('Error fetching consultation requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch consultation requests' },
      { status: 500 }
    )
  }
}

