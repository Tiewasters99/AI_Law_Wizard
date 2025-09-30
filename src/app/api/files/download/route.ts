import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }

    // Get file metadata from database
    const fileRecord = await prisma.embeddingJob.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        fileName: true,
        originalName: true,
        fileType: true,
        fileSize: true,
        filePath: true,
        isOneDriveFile: true
      }
    })

    if (!fileRecord) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // For Document Library, redirect to the stored file URL
    if (fileRecord.filePath) {
      // Return redirect to the file URL
      return NextResponse.redirect(fileRecord.filePath)
    }

    return NextResponse.json(
      { error: 'File not available for download' },
      { status: 404 }
    )

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}
