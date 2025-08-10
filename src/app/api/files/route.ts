import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('Files listing API called')
    
    // Get all embedding jobs from database
    const jobs = await prisma.embeddingJob.findMany({
      orderBy: {
        createdAt: 'desc'
      },
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

    return NextResponse.json({
      success: true,
      files: fileDetails,
      total: fileDetails.length,
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
