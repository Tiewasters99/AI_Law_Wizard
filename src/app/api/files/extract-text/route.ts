import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    let extractedText = ''

    // Extract text based on file type
    if (file.type === 'application/pdf') {
      // Extract text from PDF using PDFLoader
      const loader = new PDFLoader(file as any)
      const docs = await loader.load()
      extractedText = docs.map(doc => doc.pageContent).join('\n\n')
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Convert File to Buffer for mammoth
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      // Extract text from DOCX
      const result = await mammoth.extractRawText({ buffer })
      extractedText = result.value
    } else if (file.type === 'text/plain') {
      // Read text file
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      extractedText = buffer.toString('utf-8')
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, DOCX, or TXT files.' },
        { status: 400 }
      )
    }

    // Limit text for free tier (e.g., 50,000 characters)
    const MAX_TEXT_LENGTH = 50000
    if (extractedText.length > MAX_TEXT_LENGTH) {
      extractedText = extractedText.substring(0, MAX_TEXT_LENGTH) + '\n\n[Text truncated for free tier]'
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      fileName: file.name,
      fileType: file.type,
      textLength: extractedText.length
    })

  } catch (error) {
    console.error('Text extraction error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract text from document' 
      },
      { status: 500 }
    )
  }
}

