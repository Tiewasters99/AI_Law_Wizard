import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pacerClient } from '@/app/lib/pacerClient'
import type { PacerCredentials } from '@/types/pacer'

/**
 * POST /api/pacer/auth
 * Authenticate with PACER
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated and is an attorney
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access PACER' },
        { status: 401 }
      )
    }

    // Check if user is attorney
    const isAttorney = session.user.role === 'ATTORNEY' || session.user.role === 'LAWYER'
    if (!isAttorney) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only attorneys can access PACER integration' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { username, password, clientCode , otpCode, redactFlag}: PacerCredentials = body

    // Validate credentials
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Authenticate with PACER
    const authResponse = await pacerClient.authenticate({
      username,
      password,
      clientCode,
      otpCode,
      redactFlag
    })

    console.log('[PACER Auth API] Authentication response:', {
      success: authResponse.success,
      hasSessionToken: !!authResponse.sessionToken,
      sessionTokenLength: authResponse.sessionToken?.length,
      userInfo: authResponse.userInfo,
      expiresAt: authResponse.expiresAt
    })

    // Validate response before sending to client
    if (!authResponse.sessionToken) {
      console.error('[PACER Auth API] ERROR: No sessionToken in auth response!')
      throw new Error('Authentication succeeded but no session token was returned')
    }

    // Return success response
    const response = {
      ...authResponse,
      success: true,
    }
    
    console.log('[PACER Auth API] ✅ Returning to client:', {
      success: response.success,
      hasSessionToken: !!response.sessionToken,
      hasUserInfo: !!response.userInfo,
      hasExpiresAt: !!response.expiresAt
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('PACER authentication error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
    
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication failed',
        message: errorMessage,
      },
      { status: 401 }
    )
  }
}

