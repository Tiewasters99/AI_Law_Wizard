import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get single consultation request details
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

    const consultationRequest = await prisma.consultationRequest.findUnique({
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
                industry: true,
                phone: true,
                address: true,
                needs: true
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
                yearsOfExperience: true,
                bio: true,
                verified: true
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
      }
    })

    if (!consultationRequest) {
      return NextResponse.json({ error: 'Consultation request not found' }, { status: 404 })
    }

    // Check if user is part of this consultation request
    if (
      consultationRequest.clientId !== session.user.id &&
      consultationRequest.attorneyId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ 
      success: true,
      consultationRequest
    })

  } catch (error) {
    console.error('Error fetching consultation request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch consultation request' },
      { status: 500 }
    )
  }
}

// PATCH - Update consultation request status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get consultation request
    const consultationRequest = await prisma.consultationRequest.findUnique({
      where: { id },
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

    if (!consultationRequest) {
      return NextResponse.json({ error: 'Consultation request not found' }, { status: 404 })
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

    // Authorization checks based on status change
    if (status === 'ACCEPTED' || status === 'REJECTED') {
      // Only attorney can accept or reject
      if (consultationRequest.attorneyId !== session.user.id) {
        return NextResponse.json({ error: 'Only the attorney can accept or reject requests' }, { status: 403 })
      }
    } else if (status === 'CANCELLED') {
      // Only client can cancel
      if (consultationRequest.clientId !== session.user.id) {
        return NextResponse.json({ error: 'Only the client can cancel requests' }, { status: 403 })
      }
    } else if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
      // Either party can update to these statuses
      if (
        consultationRequest.clientId !== session.user.id &&
        consultationRequest.attorneyId !== session.user.id
      ) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Update consultation request and create notification in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.consultationRequest.update({
        where: { id },
        data: { status },
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
          },
          conversation: {
            select: {
              id: true
            }
          }
        }
      })

      // Create notification for the other party
      const recipientId = isAttorney ? updated.clientId : updated.attorneyId
      const senderName = isAttorney ? updated.attorney.name : updated.client.name

      let notificationTitle = ''
      let notificationMessage = ''
      let notificationType: 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED' | 'REQUEST_CANCELLED' | 'NEW_REQUEST' = 'NEW_REQUEST'

      if (status === 'ACCEPTED') {
        notificationType = 'REQUEST_ACCEPTED'
        notificationTitle = 'Request Accepted'
        notificationMessage = `${senderName} accepted your consultation request`
      } else if (status === 'REJECTED') {
        notificationType = 'REQUEST_REJECTED'
        notificationTitle = 'Request Rejected'
        notificationMessage = `${senderName} rejected your consultation request`
      } else if (status === 'CANCELLED') {
        notificationType = 'REQUEST_CANCELLED'
        notificationTitle = 'Request Cancelled'
        notificationMessage = `${senderName} cancelled the consultation request`
      }

      if (notificationTitle) {
        await tx.notification.create({
          data: {
            userId: recipientId,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            relatedId: updated.id
          }
        })
      }

      return updated
    })

    return NextResponse.json({ 
      success: true,
      consultationRequest: result
    })

  } catch (error) {
    console.error('Error updating consultation request:', error)
    return NextResponse.json(
      { error: 'Failed to update consultation request' },
      { status: 500 }
    )
  }
}

