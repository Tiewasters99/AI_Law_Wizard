import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pacerClient } from '@/app/lib/pacerClient'

/**
 * POST /api/pacer/logout
 * End PACER session
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { sessionToken } = body

    // Validate session token
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Session token is required' },
        { status: 400 }
      )
    }

    // Logout from PACER
    await pacerClient.logout(sessionToken)

    return NextResponse.json({
      success: true,
      message: 'PACER session ended successfully',
    })

  } catch (error) {
    console.error('PACER logout error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Logout failed'
    
    return NextResponse.json(
      {
        success: false,
        error: 'Logout failed',
        message: errorMessage,
      },
      { status: 500 }
    )
  }
}

