import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pacerClient } from '@/app/lib/pacerClient'
import { validateCaseNumber } from '@/app/lib/courtConfig'
import { getUserFriendlyMessage } from '@/app/lib/pacerErrors'

/**
 * POST /api/pacer/docket/estimate-fee
 * Estimate docket fees before fetching full report
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
    const { sessionToken, caseNumber, court } = body

    // Validate required parameters
    if (!sessionToken || !caseNumber || !court) {
      return NextResponse.json(
        { 
          error: 'Invalid request', 
          message: 'Session token, case number, and court are required' 
        },
        { status: 400 }
      )
    }

    // Validate case number format
    if (!validateCaseNumber(caseNumber, court)) {
      return NextResponse.json(
        { 
          error: 'Invalid case number', 
          message: `Invalid case number format for ${court}: ${caseNumber}` 
        },
        { status: 400 }
      )
    }

    // Validate court is supported
    if (court.toLowerCase() !== 'nysd') {
      return NextResponse.json(
        { 
          error: 'Unsupported court', 
          message: `Court ${court} is not yet supported. Currently supported: NYSD` 
        },
        { status: 400 }
      )
    }

    // Estimate docket fees (no charge for this operation)
    const estimatedFee = await pacerClient.estimateDocketFee(sessionToken, caseNumber, court)

    // Create fee estimate response
    const feeEstimate = {
      caseNumber,
      court,
      estimatedFee,
      breakdown: {
        docketPages: Math.ceil(estimatedFee / 0.10), // Estimate pages from fee
        documentPages: 0 // Will be calculated when fetching actual docket
      },
      confidence: estimatedFee > 0 ? 'medium' : 'low' as const,
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      ...feeEstimate,
    })

  } catch (error) {
    console.error('PACER fee estimation error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to estimate fees'
    const userMessage = getUserFriendlyMessage(error instanceof Error ? error : new Error(errorMessage))
    
    return NextResponse.json(
      {
        success: false,
        error: 'Fee estimation failed',
        message: userMessage,
        details: error instanceof Error ? error.message : errorMessage,
      },
      { status: 500 }
    )
  }
}
