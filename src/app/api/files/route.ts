import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    
    console.log('Files listing API called with pagination:', { page, limit, search })
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit
    
    // Build where clause for search
    const whereClause = search ? {
      OR: [
        { originalName: { contains: search, mode: 'insensitive' as const } },
        { fileName: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}
    
    // Get total count for pagination
    const totalCount = await prisma.embeddingJob.count({
      where: whereClause
    })
    
    // Get paginated embedding jobs from database
    const jobs = await prisma.embeddingJob.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit,
      select: {
        id: true,
        fileName: true,
        originalName: true,
        fileType: true,
        fileSize: true,
        status: true,
        totalChunks: true,
        processedChunks: true,
        failedChunks: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true
      }
    })

    const fileDetails = jobs.map(job => ({
      id: job.id,
      fileName: job.fileName,
      originalName: job.originalName,
      size: job.fileSize,
      type: job.fileType,
      status: job.status,
      totalChunks: job.totalChunks,
      processedChunks: job.processedChunks,
      failedChunks: job.failedChunks,
      uploadedAt: job.createdAt.toISOString(),
      modifiedAt: job.updatedAt.toISOString(),
      completedAt: job.completedAt?.toISOString() || null
    }))

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      files: fileDetails,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      },
      message: `${fileDetails.length} file(s) found`
    })

  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list files' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId parameter is required' },
        { status: 400 }
      )
    }

    // Delete the job and all associated chunks (cascade)
    await prisma.embeddingJob.delete({
      where: {
        id: jobId
      }
    })

    return NextResponse.json({
      success: true,
      message: `Job ${jobId} and associated chunks deleted successfully`
    })

  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete job' },
      { status: 500 }
    )
  }
}
