import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

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

        // Generate unique filename
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 15)
        const fileExtension = file.name.split('.').pop() || 'txt'
        const fileName = `${timestamp}-${randomId}.${fileExtension}`

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Vercel Blob
        const { url } = await put(fileName, buffer, { 
          access: 'public',
          addRandomSuffix: false
        })

        uploadedFiles.push({
          id: `file-${timestamp}-${randomId}`,
          originalName: file.name,
          fileName: fileName,
          size: file.size,
          type: file.type,
          url: url,
          uploadedAt: new Date().toISOString()
        })

        console.log(`File uploaded: ${file.name} -> ${url}`)
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
    return NextResponse.json({
      message: 'File upload endpoint is working with Vercel Blob storage'
    })
  } catch (error) {
    console.error('Error in GET endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
