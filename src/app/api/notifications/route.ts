import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const skip = (page - 1) * limit

    // Fetch notifications
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId: session.user.id,
          ...(unreadOnly && { isRead: false })
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip
      }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          ...(unreadOnly && { isRead: false })
        }
      }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          isRead: false
        }
      })
    ])

    return NextResponse.json({ 
      success: true,
      notifications,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      },
      unreadCount
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationIds, markAllAsRead } = await request.json()

    if (markAllAsRead) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false
        },
        data: {
          isRead: true
        }
      })

      return NextResponse.json({ 
        success: true,
        message: 'All notifications marked as read'
      })
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: {
            in: notificationIds
          },
          userId: session.user.id
        },
        data: {
          isRead: true
        }
      })

      return NextResponse.json({ 
        success: true,
        message: 'Notifications marked as read'
      })
    } else {
      return NextResponse.json({ 
        error: 'Invalid request. Provide notificationIds array or markAllAsRead flag' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
}

