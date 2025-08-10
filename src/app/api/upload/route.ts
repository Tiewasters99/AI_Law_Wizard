import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    console.log('File upload API called')
    
    const formData = await request.formData()
    const files = formData.getAll('files')
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadedFiles = []
    
    for (const file of files) {
      if (!(file instanceof File)) {
        continue
      }

      try {
        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
          return NextResponse.json(
            { error: `File ${file.name} is too large. Maximum size is 10MB.` },
            { status: 400 }
          )
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'uploads')
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 15)
        const fileExtension = file.name.split('.').pop() || 'txt'
        const fileName = `${timestamp}-${randomId}.${fileExtension}`
        const filePath = join(uploadsDir, fileName)

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        await writeFile(filePath, buffer)

        uploadedFiles.push({
          id: `file-${timestamp}-${randomId}`,
          originalName: file.name,
          fileName: fileName,
          size: file.size,
          type: file.type,
          path: filePath,
          uploadedAt: new Date().toISOString()
        })

        console.log(`File uploaded: ${file.name} -> ${fileName}`)
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error)
        return NextResponse.json(
          { error: `Failed to upload file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length} file(s) uploaded successfully`
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown upload error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // List uploaded files (for debugging/admin purposes)
    const uploadsDir = join(process.cwd(), 'uploads')
    
    if (!existsSync(uploadsDir)) {
      return NextResponse.json({ files: [] })
    }

    // This would need a proper file listing implementation
    // For now, just return a success message
    return NextResponse.json({
      message: 'File upload endpoint is working',
      uploadsDir
    })
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    )
  }
}
