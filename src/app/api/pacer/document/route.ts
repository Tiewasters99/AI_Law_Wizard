import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pacerClient } from '@/app/lib/pacerClient'

/**
 * POST /api/pacer/document
 * Download a court document
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
    const { sessionToken, documentId, caseNumber, court } = body

    // Validate required parameters
    if (!sessionToken || !documentId || !caseNumber || !court) {
      return NextResponse.json(
        { 
          error: 'Invalid request', 
          message: 'Session token, document ID, case number, and court are required' 
        },
        { status: 400 }
      )
    }

    // Download document
    const downloadResponse = await pacerClient.downloadDocument(
      documentId,
      caseNumber,
      court,
      sessionToken
    )

    return NextResponse.json({
      success: true,
      ...downloadResponse,
    })

  } catch (error) {
    console.error('PACER document download error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to download document'
    
    return NextResponse.json(
      {
        success: false,
        error: 'Document download failed',
        message: errorMessage,
      },
      { status: 500 }
    )
  }
}

