import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getChunksWithSummaries } from '../../../lib/summaryService'

interface FileContentRequest {
  fileId: string
  fileName: string
}

interface FileContentResponse {
  success: boolean
  content?: string
  error?: string
  fileName?: string
  fileSize?: number
}

// Helper function to extract file content from buffer
const extractFileContent = async (buffer: Buffer, fileName: string) => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''

  try {
    switch (fileExtension) {
      case 'pdf':
        return await extractPDFContent(buffer)
      case 'doc':
      case 'docx':
        return await extractWordContent(buffer)
      case 'txt':
      case 'json':
      default:
        return buffer.toString('utf-8')
    }
  } catch (error) {
    console.error(`Error extracting content from ${fileName}:`, error)
    throw new Error(`Failed to extract content from ${fileName}`)
  }
}

const extractPDFContent = async (buffer: Buffer) => {
  try {
    const { PDFLoader } = await import('@langchain/community/document_loaders/fs/pdf')
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
    if (arrayBuffer instanceof SharedArrayBuffer) {
      throw new Error('SharedArrayBuffer is not supported for PDF processing')
    }
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
    const loader = new PDFLoader(blob)
    const docs = await loader.load()
    return docs.map(doc => doc.pageContent).join('\n')
  } catch (error) {
    throw new Error(`PDF parsing error: ${error}`)
  }
}

const extractWordContent = async (buffer: Buffer) => {
  try {
    const mammoth = await import('mammoth')
    const { value } = await mammoth.extractRawText({ buffer })
    return value
  } catch (error) {
    throw new Error(`Word document parsing error: ${error}`)
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<FileContentResponse>> {
  try {
    const body: FileContentRequest = await request.json()
    const { fileId, fileName } = body

    if (!fileId) {
      return NextResponse.json({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }

    console.log(`📁 Fetching content for file: ${fileName} (ID: ${fileId})`)

    // Try to get the original file from embedding jobs
    const jobs = await prisma.embeddingJob.findMany({
      where: { 
        status: 'COMPLETED',
        fileName: fileName
      },
      select: { 
        id: true, 
        fileName: true, 
        filePath: true,
        fileSize: true,
        isOneDriveFile: true,
        oneDriveId: true
      }
    })

    if (jobs.length > 0) {
      const job = jobs[0]
      
      // If it's a OneDrive file, try to get content from OneDrive
      if (job.isOneDriveFile && job.oneDriveId) {
        try {
          // This would need to be implemented based on your OneDrive integration
          // For now, we'll return a placeholder
          return NextResponse.json({
            success: true,
            content: `Content for OneDrive file: ${fileName}\n\nThis file is stored in OneDrive and requires authentication to access.`,
            fileName: fileName,
            fileSize: job.fileSize || 0
          })
        } catch (error) {
          console.error('OneDrive content fetch failed:', error)
        }
      }
      
      // If it's a local file, try to fetch from the file path
      if (job.filePath) {
        try {
          const response = await fetch(job.filePath)
          if (response.ok) {
            const buffer = Buffer.from(await response.arrayBuffer())
            const content = await extractFileContent(buffer, fileName)
            
            return NextResponse.json({
              success: true,
              content: content,
              fileName: fileName,
              fileSize: job.fileSize || content.length
            })
          }
        } catch (error) {
          console.error('Local file fetch failed:', error)
        }
      }
    }

    // Fallback: Try to get content from chunks if available
    try {
      const jobId = fileId.split('__')[0]
      console.log(`Trying to get chunks for job ID: ${jobId}`)
      
      const chunks = await getChunksWithSummaries(jobId)
      if (chunks && chunks.length > 0) {
        const content = chunks.map(chunk => chunk.content).join('\n\n')
        console.log(`Retrieved ${chunks.length} chunks with ${content.length} characters`)
        
        return NextResponse.json({
          success: true,
          content: content,
          fileName: fileName,
          fileSize: content.length
        })
      } else {
        console.log('No chunks found for job ID:', jobId)
      }
    } catch (error) {
      console.error('Chunk content fetch failed:', error)
    }

    return NextResponse.json({
      success: false,
      error: 'File content not found or accessible'
    }, { status: 404 })

  } catch (error) {
    console.error('❌ File content fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error while fetching file content'
    }, { status: 500 })
  }
}
