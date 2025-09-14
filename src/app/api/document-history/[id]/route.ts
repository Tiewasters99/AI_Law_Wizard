import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// GET - Fetch single query by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const query = await prisma.documentQuery.findUnique({
      where: { id },
      select: {
        id: true,
        userQuery: true,
        aiResponse: true,
        searchQuery: true,
        success: true,
        error: true,
        confidence: true,
        processingTime: true,
        totalSteps: true,
        completedSteps: true,
        toolsUsed: true,
        filesProcessed: true,
        userId: true,
        sessionId: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: query
    })

  } catch (error) {
    console.error('Error fetching query:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch query'
    }, { status: 500 })
  }
}

// DELETE - Delete specific query
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.documentQuery.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Query deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting query:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete query'
    }, { status: 500 })
  }
}
