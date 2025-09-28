'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

// Progress Event Types (matching backend)
export enum ProgressEventType {
  CONNECTION = 'connection',
  STARTED = 'started',
  CLASSIFICATION = 'classification',
  FILES_SEARCH = 'files_search',
  FILES_FOUND = 'files_found',
  CHAIN_DETECTED = 'chain_detected',
  OPERATION_START = 'operation_start',
  OPERATION_PROGRESS = 'operation_progress',
  OPERATION_COMPLETE = 'operation_complete',
  INTERMEDIATE_RESULT = 'intermediate_result',
  FINAL_RESULT = 'final_result',
  FINAL_SUMMARY = 'final_summary',
  COMPLETE = 'complete',
  ERROR = 'error'
}

export interface ProgressEvent {
  id?: string
  type: ProgressEventType
  timestamp: string
  message: string
  step?: number
  totalSteps?: number
  operation?: string
  confidence?: number
  data?: any
  error?: string
}

export interface OperationStep {
  operation: 'summary' | 'file_operation' | 'qa' | 'analysis' | 'extraction' | 'transformation'
  fileOperationType?: 'merge' | 'append'
  description?: string
  confidence?: number
}

export interface ProcessingRequest {
  userPrompt: string
  searchQuery?: string
}

export interface ProcessingState {
  isProcessing: boolean
  isConnected: boolean
  events: ProgressEvent[]
  currentStep: number
  totalSteps: number
  operationChain: OperationStep[]
  intermediateResults: string[]
  finalResult: string | null
  error: string | null
  processedFiles: any[]
  confidence: number
  isChain: boolean
  processingTime: number
}

export interface ProcessingHookResult extends ProcessingState {
  startProcessing: (request: ProcessingRequest) => void
  stopProcessing: () => void
  clearState: () => void
  getLatestEvent: (type: ProgressEventType) => ProgressEvent | null
  getEventsByType: (type: ProgressEventType) => ProgressEvent[]
}

const initialState: ProcessingState = {
  isProcessing: false,
  isConnected: false,
  events: [],
  currentStep: 0,
  totalSteps: 1,
  operationChain: [],
  intermediateResults: [],
  finalResult: null,
  error: null,
  processedFiles: [],
  confidence: 0,
  isChain: false,
  processingTime: 0
}

export const useDocumentProcessing = (): ProcessingHookResult => {
  const [state, setState] = useState<ProcessingState>(initialState)
  const startTimeRef = useRef<number>(0)
  const isProcessingRef = useRef<boolean>(false)

  const addEvent = useCallback((event: ProgressEvent) => {
    setState(prevState => ({
      ...prevState,
      events: [...prevState.events, event]
    }))
  }, [])

  // Simplified state management for REST API only
  const updateProcessingState = useCallback((updates: Partial<ProcessingState>) => {
    setState(prevState => ({ ...prevState, ...updates }))
  }, [])

  // REST API processing function
  const processWithREST = useCallback(async (request: ProcessingRequest) => {
    try {
      // Start processing
      startTimeRef.current = Date.now()
      updateProcessingState({
        isProcessing: true,
        error: null,
        events: [{
          type: ProgressEventType.STARTED,
          timestamp: new Date().toISOString(),
          message: 'Processing started'
        }]
      })

      const response = await fetch('/api/document-processing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      // Check if response is ok first
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('API Response:', data) // Debug logging
      console.log('Processed Files from API:', data.processedFiles) // Debug processed files

      if (data.success && data.result) {
        // Map processed files to expected format
        const processedFiles = data.processedFiles?.map((file: any, index: number) => ({
          fileId: file.fileId || `file-${index}`,
          fileName: file.fileName || 'Unknown',
          originalName: file.originalName || file.fileName || 'Unknown',
          fileSize: file.fileSize || 0,
          downloadUrl: file.downloadUrl || '',
          fileType: file.fileType || 'txt',
          jobId: file.jobId,
          totalChunks: file.totalChunks,
          processedChunks: file.processedChunks,
          isOneDriveFile: file.isOneDriveFile,
          oneDriveId: file.oneDriveId
        })) || []
        
        console.log('Mapped Processed Files:', processedFiles) // Debug mapped files

        // Calculate processing time
        const processingTime = (Date.now() - startTimeRef.current) / 1000

        // Update state with final result
        updateProcessingState({
          isProcessing: false,
          finalResult: data.result,
          processedFiles,
          processingTime,
          confidence: data.confidence || 0,
          operationChain: data.operationChain || [],
          totalSteps: data.totalSteps || 1,
          currentStep: data.totalSteps || 1,
          isChain: (data.operationChain?.length || 0) > 1
        })

      } else {
        // Enhanced error logging for debugging
        console.error('Processing failed:', {
          success: data.success,
          result: data.result,
          error: data.error,
          fullResponse: data
        })
        
        // Provide more specific error message
        const errorMsg = data.error || 
                        (!data.success ? 'Processing was not successful' : '') ||
                        (!data.result ? 'No result returned from processing' : '') ||
                        'Processing failed for unknown reason'
        
        throw new Error(errorMsg)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      updateProcessingState({
        isProcessing: false,
        error: errorMessage
      })
    } finally {
      isProcessingRef.current = false
    }
  }, [updateProcessingState])

  const startProcessing = useCallback((request: ProcessingRequest) => {
    // Prevent multiple concurrent requests
    if (isProcessingRef.current) {
      console.warn('Processing already in progress, ignoring new request')
      return
    }

    // Validate input
    if (!request.userPrompt?.trim()) {
      console.error('Invalid request: empty prompt')
      return
    }

    // Reset state and start processing
    setState(initialState)
    isProcessingRef.current = true

    // Clean and prepare request
    const cleanRequest = {
      userPrompt: request.userPrompt.trim(),
      ...(request.searchQuery?.trim() && { searchQuery: request.searchQuery.trim() })
    }

    // Start REST API processing
    processWithREST(cleanRequest)
  }, [processWithREST])

  const stopProcessing = useCallback(() => {
    // Clear processing flag to stop any ongoing operations
    isProcessingRef.current = false
    
    updateProcessingState({
      isProcessing: false,
      isConnected: false
    })
  }, [updateProcessingState])

  const clearState = useCallback(() => {
    isProcessingRef.current = false
    setState(initialState)
  }, [])

  const getLatestEvent = useCallback((type: ProgressEventType): ProgressEvent | null => {
    const events = state.events.filter(event => event.type === type)
    return events.length > 0 ? events[events.length - 1] : null
  }, [state.events])

  const getEventsByType = useCallback((type: ProgressEventType): ProgressEvent[] => {
    return state.events.filter(event => event.type === type)
  }, [state.events])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear processing flag
      isProcessingRef.current = false
    }
  }, [])

  return {
    ...state,
    startProcessing,
    stopProcessing,
    clearState,
    getLatestEvent,
    getEventsByType
  }
}
