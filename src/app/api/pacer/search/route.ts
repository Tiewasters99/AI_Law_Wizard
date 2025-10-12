import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pacerClient } from '@/app/lib/pacerClient'
import type { PacerSearchQuery } from '@/types/pacer'

/**
 * POST /api/pacer/search
 * Search for cases in PACER
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated and is an attorney
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in' },
        { status: 401 }
      )
    }

    const isAttorney = session.user.role === 'ATTORNEY' || session.user.role === 'LAWYER'
    if (!isAttorney) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only attorneys can access PACER' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { sessionToken, query }: { sessionToken: string; query: PacerSearchQuery } = body

    // Validate session token
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Session token is required' },
        { status: 400 }
      )
    }

    // Validate query has at least one search parameter
    if (!query.caseNumber && !query.caseTitle && !query.partyName && !query.attorneyName) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'At least one search parameter is required' },
        { status: 400 }
      )
    }

    // Search cases
    const results = await pacerClient.searchCases(query, sessionToken)

    return NextResponse.json({
      success: true,
      ...results,
    })

  } catch (error) {
    console.error('PACER search error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Search failed'
    
    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
        message: errorMessage,
        cases: [],
        totalCount: 0,
      },
      { status: 500 }
    )
  }
}

