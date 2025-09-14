'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { useToast } from '../ui/use-toast'
import { 
  Brain, 
  FileText, 
  Download, 
  Edit3, 
  Save, 
  X, 
  Play, 
  CheckCircle, 
  Pause,
  Loader2
} from 'lucide-react'

// Import real-time processing hook
import { useDocumentProcessing } from '../../hooks/useDocumentProcessing'

interface ProcessedFileInfo {
  fileId: string
  fileName: string
  originalName: string
  contentLength: number
  fileSize: number
  url: string
}

interface GrokProcessingProps {
  onComplete?: (result: string, generatedFile: string) => void
  onBeforeStart?: () => Promise<boolean> | boolean
}

export function GrokProcessingInterface({ onComplete, onBeforeStart }: GrokProcessingProps) {
  // Input state
  const [userPrompt, setUserPrompt] = useState('')
  
  // UI state
  const [showFileEditor, setShowFileEditor] = useState(false)
  const [editedFile, setEditedFile] = useState('')
  const [generatedFile, setGeneratedFile] = useState('')
  
  // Real-time processing hook
  const processingState = useDocumentProcessing()
  
  const { toast } = useToast()
  const fileEditorRef = useRef<HTMLTextAreaElement>(null)
  
  // Determine current processing state
  const isProcessing = processingState.isProcessing
  const finalResult = processingState.finalResult || ''
  const processedFiles = processingState.processedFiles

  // Handle processing completion
  useEffect(() => {
    if (!processingState.isProcessing && processingState.finalResult && !processingState.error) {
      // Processing completed successfully
      toast({
        title: 'Analysis Complete',
        description: `Successfully processed ${processingState.processedFiles?.length || 0} relevant documents`
      })

      if (onComplete) {
        onComplete(processingState.finalResult, processingState.finalResult)
      }
    } else if (processingState.error) {
      // Only show actual processing errors, not connection issues
      const error = processingState.error
      
      // Skip connection-related errors - these are handled automatically
      if (error.includes('Connection failed') || 
          error.includes('Connection timeout') || 
          error.includes('Maximum connection attempts') ||
          error.includes('fetch')) {
        return // Don't show these to users
      }

      // Show only meaningful processing errors
      let errorTitle = 'Analysis Failed'
      let errorDescription = error

      if (error.includes('No relevant documents found')) {
        errorTitle = 'No Documents Found'
        errorDescription = 'No relevant documents found for your query. Try rephrasing your request or upload more documents.'
      } else if (error.includes('Processing timeout')) {
        errorTitle = 'Processing Timeout'
        errorDescription = 'The analysis took too long to complete. Please try with a simpler request.'
      } else if (error.includes('Invalid request') || error.includes('User prompt is required')) {
        return // Don't show validation errors as toasts
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive'
      })
    }
  }, [processingState.isProcessing, processingState.finalResult, processingState.error, processingState.processedFiles, toast, onComplete])

  const handleProcess = async () => {
    // Prevent rapid successive clicks
    if (isProcessing) {
      return
    }

    if (!userPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please describe what you would like to analyze',
        variant: 'destructive'
      })
      return
    }

    // Check token requirements before starting
    if (onBeforeStart) {
      try {
        const canProceed = await onBeforeStart()
        if (!canProceed) {
          return
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to validate requirements',
          variant: 'destructive'
        })
        return
      }
    }

    // Clear previous state and start processing
    processingState.clearState()
    
    toast({
      title: 'Starting Analysis',
      description: 'Processing your request...',
    })

    processingState.startProcessing({
      userPrompt: userPrompt.trim()
    })
  }

  const handleStopProcessing = () => {
    processingState.stopProcessing()
    toast({
      title: 'Analysis Stopped',
      description: 'Processing has been stopped',
    })
  }

  const handleDownloadFile = () => {
    const blob = new Blob([editedFile], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grok_processing_report_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSaveChanges = () => {
    setGeneratedFile(editedFile)
    setShowFileEditor(false)
    toast({
      title: 'Success',
      description: 'Changes saved successfully'
    })
  }


  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">AI Document Analysis</h2>
          </div>
          <p className="text-lg text-gray-600">Ask questions, request summaries, or extract insights from your documents</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-4 text-gray-900">
              What would you like to analyze? *
            </label>
            <Textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Describe what you want to analyze, extract, or understand from your documents..."
              rows={6}
              disabled={isProcessing}
              className="text-lg resize-none border-2 border-gray-200 focus:border-blue-500 rounded-xl p-4 shadow-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleProcess} 
              disabled={isProcessing || !userPrompt.trim()}
              className="flex-1 h-14 text-lg bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-3" />
                  Start Analysis
                </>
              )}
            </Button>

            {isProcessing && (
              <Button 
                onClick={handleStopProcessing}
                variant="outline"
                size="lg"
                className="h-14 px-8 border-2 border-gray-300 hover:bg-gray-50 rounded-xl"
              >
                <Pause className="w-5 h-5 mr-2" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Simple Processing Indicator */}
      {isProcessing && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl py-12 px-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Processing your request...</h3>
              <p className="text-blue-700">
                Analyzing documents and generating insights
              </p>
            </div>
          </div>
        </div>
      )}


      {/* Final Result */}
      {finalResult && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-green-900">Analysis Result</h3>
          </div>
          <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm">
            <pre className="whitespace-pre-wrap text-base text-gray-800 leading-relaxed">{finalResult}</pre>
          </div>
        </div>
      )}

      {/* Generated File Section */}
      {generatedFile && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-gray-700" />
              <h3 className="text-xl font-semibold text-gray-900">Generated Report</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFileEditor(!showFileEditor)}
                className="border-2 border-gray-300 hover:bg-gray-100 rounded-xl"
              >
                {showFileEditor ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                {showFileEditor ? 'Hide Editor' : 'Edit'}
              </Button>
              <Button
                onClick={handleDownloadFile}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          
          {showFileEditor ? (
            <div className="space-y-4">
              <Textarea
                ref={fileEditorRef}
                value={editedFile}
                onChange={(e) => setEditedFile(e.target.value)}
                rows={20}
                className="font-mono text-sm border-2 border-gray-300 rounded-xl p-4"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleSaveChanges}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditedFile(generatedFile)
                    setShowFileEditor(false)
                  }}
                  className="border-2 border-gray-300 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-gray-300 max-h-96 overflow-y-auto shadow-sm">
              <pre className="text-sm font-mono whitespace-pre-wrap text-gray-700 leading-relaxed">
                {generatedFile}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
