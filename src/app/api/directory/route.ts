import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current user's role from the database
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Determine which users to fetch based on current user's role
    const isAttorney = currentUser.role === 'ATTORNEY' || currentUser.role === 'LAWYER';
    const targetRole = isAttorney ? 'CUSTOMER' : 'ATTORNEY'

    let users

    if (isAttorney) {
      // Attorneys ONLY see clients who have sent them consultation requests
      const consultationRequests = await prisma.consultationRequest.findMany({
        where: {
          attorneyId: session.user.id
        },
        select: {
          clientId: true,
          status: true,
          id: true,
          caseType: true,
          urgency: true,
          createdAt: true,
          conversation: {
            select: {
              id: true,
              unreadByAttorney: true
            }
          }
        }
      })

      // Get unique client IDs
      const clientIds = [...new Set(consultationRequests.map(req => req.clientId))]

      // Fetch client details
      users = await prisma.user.findMany({
        where: {
          id: {
            in: clientIds
          },
          role: 'CUSTOMER',
          profileComplete: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          profileData: true,
          createdAt: true,
          customerProfile: {
            select: {
              companyName: true,
              address: true,
              phone: true,
              industry: true,
              needs: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      // Attach consultation request info to each user
      users = users.map(user => {
        const userRequests = consultationRequests.filter(req => req.clientId === user.id)
        return {
          ...user,
          consultationRequests: userRequests
        }
      })
    } else {
      // Customers see all attorneys
      users = await prisma.user.findMany({
        where: {
          OR: [{ role: 'ATTORNEY' }, { role: 'LAWYER' }],
          profileComplete: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          profileData: true,
          createdAt: true,
          lawyerProfile: {
            select: {
              specialty: true,
              barLicense: true,
              bio: true,
              yearsOfExperience: true,
              firmName: true,
              verified: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      // Check if client has sent requests to any attorneys
      const clientRequests = await prisma.consultationRequest.findMany({
        where: {
          clientId: session.user.id
        },
        select: {
          attorneyId: true,
          status: true,
          id: true
        }
      })

      // Attach request status to each attorney
      users = users.map(user => {
        const existingRequest = clientRequests.find(req => req.attorneyId === user.id)
        return {
          ...user,
          existingRequest: existingRequest || null
        }
      })
    }

    return NextResponse.json({ 
      users,
      currentUserRole: currentUser.role,
      targetRole,
      success: true 
    })
  } catch (error) {
    console.error('Error fetching directory users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', success: false },
      { status: 500 }
    )
  }
}

