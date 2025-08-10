import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(request: NextRequest) {
  try {
    console.log('Files listing API called')
    
    const uploadsDir = join(process.cwd(), 'uploads')
    
    if (!existsSync(uploadsDir)) {
      return NextResponse.json({ 
        files: [],
        message: 'No uploads directory found'
      })
    }

    // Read all files in the uploads directory
    const files = await readdir(uploadsDir)
    const fileDetails = []

    for (const fileName of files) {
      try {
        const filePath = join(uploadsDir, fileName)
        const fileStats = await stat(filePath)
        
        // Skip directories
        if (fileStats.isDirectory()) {
          continue
        }

        // Extract original name from timestamp-id format if possible
        let originalName = fileName
        const timestampMatch = fileName.match(/^(\d+)-([a-zA-Z0-9]+)\.(.+)$/)
        if (timestampMatch) {
          // For now, just use the filename as is
          // You could store original names in a separate metadata file
          originalName = fileName
        }

        fileDetails.push({
          id: fileName.replace(/\.[^/.]+$/, ''), // Remove extension for ID
          fileName: fileName,
          originalName: originalName,
          size: fileStats.size,
          uploadedAt: fileStats.birthtime.toISOString(),
          modifiedAt: fileStats.mtime.toISOString(),
          path: filePath
        })
      } catch (error) {
        console.error(`Error reading file ${fileName}:`, error)
        // Continue with other files
      }
    }

    // Sort files by upload date (newest first)
    fileDetails.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

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
    const fileName = searchParams.get('fileName')
    
    if (!fileName) {
      return NextResponse.json(
        { error: 'fileName parameter is required' },
        { status: 400 }
      )
    }

    const uploadsDir = join(process.cwd(), 'uploads')
    const filePath = join(uploadsDir, fileName)
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Import unlink dynamically to avoid issues
    const { unlink } = await import('fs/promises')
    await unlink(filePath)

    return NextResponse.json({
      success: true,
      message: `File ${fileName} deleted successfully`
    })

  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete file' },
      { status: 500 }
    )
  }
}
