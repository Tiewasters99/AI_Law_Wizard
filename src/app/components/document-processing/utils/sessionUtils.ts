import type { ProcessedFileInfo } from '../../../stores/documentProcessingStore'

interface CreateSessionParams {
  userPrompt: string
  processedFiles: ProcessedFileInfo[]
  analysisResult: string
}

interface SessionResponse {
  success: boolean
  session?: {
    id: string
    [key: string]: any
  }
  error?: string
}

/**
 * Create a document analysis session for chat continuity
 */
export const createDocumentAnalysisSession = async ({
  userPrompt,
  processedFiles,
  analysisResult
}: CreateSessionParams): Promise<string | null> => {
  try {
    console.log('📝 Creating document analysis session with context...')
    console.log('Original Query:', userPrompt)
    console.log('Processed Files:', processedFiles.length)
    console.log('Analysis Result Length:', analysisResult.length)

    const response = await fetch('/api/document-processing/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'qa',
        title: `Document Analysis: ${userPrompt.substring(0, 50)}...`,
        context: {
          originalQuery: userPrompt,
          processedFiles,
          analysisResult,
          timestamp: new Date().toISOString(),
          fileIds: processedFiles.map((f) => f.jobId || f.fileId).filter(Boolean)
        }
      })
    })

    const data: SessionResponse = await response.json()

    if (data.success && data.session) {
      console.log('✅ Document analysis session created:', data.session.id)
      return data.session.id
    } else {
      throw new Error(data.error || 'Failed to create session')
    }
  } catch (error) {
    console.error('❌ Error creating document analysis session:', error)
    return null
  }
}

/**
 * Get session information
 */
export const getSessionInfo = async (sessionId: string) => {
  try {
    const response = await fetch(`/api/document-processing/sessions?sessionId=${sessionId}`)
    const data = await response.json()

    if (data.success && data.session) {
      return data.session
    }
    return null
  } catch (error) {
    console.error('Error fetching session:', error)
    return null
  }
}

