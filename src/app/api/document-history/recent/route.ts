import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// GET - Fetch recent queries and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    // Get recent queries
    const recentQueries = await prisma.documentQuery.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        userQuery: true,
        aiResponse: true,
        success: true,
        confidence: true,
        processingTime: true,
        toolsUsed: true,
        createdAt: true
      }
    })

    // Get the last executed query
    const lastQuery = await prisma.documentQuery.findFirst({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userQuery: true,
        aiResponse: true,
        success: true,
        error: true,
        confidence: true,
        processingTime: true,
        toolsUsed: true,
        filesProcessed: true,
        createdAt: true
      }
    })

    // Get statistics
    const [
      totalQueries,
      successfulQueries,
      failedQueries,
      todayQueries,
      averageProcessingTime
    ] = await Promise.all([
      prisma.documentQuery.count(),
      prisma.documentQuery.count({ where: { success: true } }),
      prisma.documentQuery.count({ where: { success: false } }),
      prisma.documentQuery.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.documentQuery.aggregate({
        _avg: { processingTime: true },
        where: { processingTime: { not: null } }
      })
    ])

    // Get most used tools
    const allQueries = await prisma.documentQuery.findMany({
      select: { toolsUsed: true },
      where: { toolsUsed: { isEmpty: false } }
    })

    const toolUsage: Record<string, number> = {}
    allQueries.forEach(query => {
      query.toolsUsed.forEach(tool => {
        toolUsage[tool] = (toolUsage[tool] || 0) + 1
      })
    })

    const mostUsedTools = Object.entries(toolUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tool, count]) => ({ tool, count }))

    return NextResponse.json({
      success: true,
      data: {
        recentQueries,
        lastQuery,
        statistics: {
          total: totalQueries,
          successful: successfulQueries,
          failed: failedQueries,
          today: todayQueries,
          successRate: totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0,
          averageProcessingTime: averageProcessingTime._avg.processingTime || 0
        },
        mostUsedTools
      }
    })

  } catch (error) {
    console.error('Error fetching recent queries:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch recent queries'
    }, { status: 500 })
  }
}
