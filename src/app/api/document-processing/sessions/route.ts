import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

interface CreateSessionRequest {
  mode: 'qa' | 'action'
  title?: string
  context?: any
}

interface SessionResponse {
  success: boolean
  session?: any
  error?: string
}

// POST - Create a new document analysis session
export const POST = async (request: NextRequest): Promise<NextResponse<SessionResponse>> => {
  try {
    const body: CreateSessionRequest = await request.json()
    const { mode, title, context } = body

    // Create document analysis session
    const session = await prisma.documentAnalysisSession.create({
      data: {
        mode: mode.toUpperCase() as 'QA' | 'ACTION',
        title: title || `Document Analysis - ${mode.toUpperCase()}`,
        context: context || {},
        isActive: true
      }
    })

    console.log(`📝 Created document analysis session: ${session.id}`)

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        mode: session.mode,
        title: session.title,
        context: session.context,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    })

  } catch (error) {
    console.error('❌ Error creating document analysis session:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create document analysis session'
    }, { status: 500 })
  }
}

// GET - Get session details
export const GET = async (request: NextRequest): Promise<NextResponse<SessionResponse>> => {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 })
    }

    const session = await prisma.documentAnalysisSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        queries: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        fileContexts: {
          orderBy: { lastAccessed: 'desc' }
        }
      }
    })

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        mode: session.mode,
        title: session.title,
        context: session.context,
        isActive: session.isActive,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messages: session.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          metadata: msg.metadata,
          tokenCount: msg.tokenCount,
          modelUsed: msg.modelUsed,
          createdAt: msg.createdAt
        })),
        queries: session.queries.map(query => ({
          id: query.id,
          userQuery: query.userQuery,
          aiResponse: query.aiResponse,
          success: query.success,
          confidence: query.confidence,
          processingTime: query.processingTime,
          createdAt: query.createdAt
        })),
        fileContexts: session.fileContexts.map(file => ({
          id: file.id,
          fileId: file.fileId,
          fileName: file.fileName,
          chunksUsed: file.chunksUsed,
          relevanceScore: file.relevanceScore,
          lastAccessed: file.lastAccessed
        }))
      }
    })

  } catch (error) {
    console.error('❌ Error fetching session:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch session'
    }, { status: 500 })
  }
}

// PUT - Update session
export const PUT = async (request: NextRequest): Promise<NextResponse<SessionResponse>> => {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const body = await request.json()

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 })
    }

    const session = await prisma.documentAnalysisSession.update({
      where: { id: sessionId },
      data: {
        ...body,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        mode: session.mode,
        title: session.title,
        context: session.context,
        isActive: session.isActive,
        updatedAt: session.updatedAt
      }
    })

  } catch (error) {
    console.error('❌ Error updating session:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update session'
    }, { status: 500 })
  }
}

// DELETE - Deactivate session
export const DELETE = async (request: NextRequest): Promise<NextResponse<SessionResponse>> => {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 })
    }

    await prisma.documentAnalysisSession.update({
      where: { id: sessionId },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('❌ Error deactivating session:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to deactivate session'
    }, { status: 500 })
  }
}
