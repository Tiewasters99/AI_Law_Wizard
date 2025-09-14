import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

// GET - Fetch query history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const successOnly = searchParams.get('successOnly') === 'true'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { userQuery: { contains: search, mode: 'insensitive' } },
        { aiResponse: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (successOnly) {
      where.success = true
    }

    // Get total count for pagination
    const total = await prisma.documentQuery.count({ where })

    // Fetch queries with pagination
    const queries = await prisma.documentQuery.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
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
        createdAt: true,
        updatedAt: true
      }
    })

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        queries,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      }
    })

  } catch (error) {
    console.error('Error fetching query history:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch query history'
    }, { status: 500 })
  }
}

// DELETE - Delete a specific query by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryId = searchParams.get('id')

    if (!queryId) {
      return NextResponse.json({
        success: false,
        error: 'Query ID is required'
      }, { status: 400 })
    }

    await prisma.documentQuery.delete({
      where: { id: queryId }
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
