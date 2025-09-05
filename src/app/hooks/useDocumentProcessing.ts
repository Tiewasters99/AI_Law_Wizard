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
  const eventSourceRef = useRef<EventSource | null>(null)
  const startTimeRef = useRef<number>(0)

  const addEvent = useCallback((event: ProgressEvent) => {
    setState(prevState => ({
      ...prevState,
      events: [...prevState.events, event]
    }))
  }, [])

  const updateStateFromEvent = useCallback((event: ProgressEvent) => {
    setState(prevState => {
      const updates: Partial<ProcessingState> = {}

      switch (event.type) {
        case ProgressEventType.CONNECTION:
          updates.isConnected = true
          break

        case ProgressEventType.STARTED:
          updates.isProcessing = true
          updates.error = null
          startTimeRef.current = Date.now()
          break

        case ProgressEventType.CLASSIFICATION:
          if (event.data?.operationChain) {
            updates.operationChain = event.data.operationChain
            updates.totalSteps = event.data.operationChain.length
            updates.isChain = event.data.isChain
          }
          if (event.confidence !== undefined) {
            updates.confidence = event.confidence
          }
          break

        case ProgressEventType.CHAIN_DETECTED:
          if (event.totalSteps) {
            updates.totalSteps = event.totalSteps
            updates.isChain = true
          }
          if (event.data?.operationChain) {
            updates.operationChain = event.data.operationChain
          }
          break

        case ProgressEventType.FILES_FOUND:
          if (event.data?.files) {
            // Map file structure to expected frontend structure
            updates.processedFiles = event.data.files.map((file: any, index: number) => ({
              fileId: `file-${index}`,
              fileName: file.fileName || 'Unknown',
              originalName: file.fileName || 'Unknown',
              contentLength: 0, // Not available in real-time mode
              fileSize: file.fileSize || 0,
              url: '', // Not needed for display
              fileType: file.fileType || 'unknown'
            }))
          }
          break

        case ProgressEventType.OPERATION_START:
          if (event.step !== undefined) {
            updates.currentStep = event.step
          }
          break

        case ProgressEventType.INTERMEDIATE_RESULT:
          if (event.data?.result) {
            updates.intermediateResults = [
              ...prevState.intermediateResults,
              event.data.result
            ]
          }
          break

        case ProgressEventType.FINAL_RESULT:
          if (event.data?.result || event.data?.resultPreview) {
            updates.finalResult = event.data.result || event.data.resultPreview
          }
          break

        case ProgressEventType.FINAL_SUMMARY:
          if (event.data?.success !== false) {
            // Extract final result from the latest intermediate result if not already set
            if (!prevState.finalResult && prevState.intermediateResults.length > 0) {
              updates.finalResult = prevState.intermediateResults[prevState.intermediateResults.length - 1]
            }
            // If still no final result, set a default message
            if (!updates.finalResult && !prevState.finalResult) {
              updates.finalResult = 'Processing completed successfully'
            }
          }
          break

        case ProgressEventType.COMPLETE:
          updates.isProcessing = false
          if (event.data?.processingTime) {
            updates.processingTime = event.data.processingTime
          } else {
            updates.processingTime = (Date.now() - startTimeRef.current) / 1000
          }
          // Ensure we have a final result when completing
          if (!prevState.finalResult && prevState.intermediateResults.length > 0) {
            updates.finalResult = prevState.intermediateResults[prevState.intermediateResults.length - 1]
          }
          break

        case ProgressEventType.ERROR:
          updates.error = event.error || event.message
          updates.isProcessing = false
          break
      }

      return { ...prevState, ...updates }
    })
  }, [])

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const progressEvent: ProgressEvent = JSON.parse(event.data)
      addEvent(progressEvent)
      updateStateFromEvent(progressEvent)
    } catch (error) {
      console.error('Error parsing progress event:', error)
      addEvent({
        type: ProgressEventType.ERROR,
        timestamp: new Date().toISOString(),
        message: 'Failed to parse progress event',
        error: String(error)
      })
    }
  }, [addEvent, updateStateFromEvent])

  const handleConnectionError = useCallback((error: Event) => {
    console.error('Connection error:', error)
    const errorEvent: ProgressEvent = {
      type: ProgressEventType.ERROR,
      timestamp: new Date().toISOString(),
      message: 'Connection error occurred',
      error: 'Connection failed'
    }
    addEvent(errorEvent)
    updateStateFromEvent(errorEvent)
  }, [addEvent, updateStateFromEvent])

  const handleConnectionClose = useCallback(() => {
    console.log('Connection closed')
    setState(prevState => ({
      ...prevState,
      isConnected: false,
      isProcessing: false
    }))
  }, [])

  const startProcessing = useCallback((request: ProcessingRequest) => {
    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    // Reset state
    setState(initialState)

    try {
      // Create real-time connection
      const params = new URLSearchParams({
        userPrompt: request.userPrompt,
        ...(request.searchQuery && { searchQuery: request.searchQuery })
      })

      const eventSource = new EventSource(`/api/document-processing?${params}`)
      eventSourceRef.current = eventSource

      // Set up event listeners
      eventSource.onmessage = handleMessage
      eventSource.onerror = handleConnectionError
      eventSource.onopen = () => {
        console.log('Real-time connection opened')
      }

      // Handle connection close
      eventSource.addEventListener('close', handleConnectionClose)

    } catch (error) {
      console.error('Failed to start processing:', error)
      const errorEvent: ProgressEvent = {
        type: ProgressEventType.ERROR,
        timestamp: new Date().toISOString(),
        message: 'Failed to start processing',
        error: String(error)
      }
      addEvent(errorEvent)
      updateStateFromEvent(errorEvent)
    }
  }, [handleMessage, handleConnectionError, handleConnectionClose, addEvent, updateStateFromEvent])

  const stopProcessing = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setState(prevState => ({
      ...prevState,
      isProcessing: false,
      isConnected: false
    }))
  }, [])

  const clearState = useCallback(() => {
    stopProcessing()
    setState(initialState)
  }, [stopProcessing])

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
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
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
