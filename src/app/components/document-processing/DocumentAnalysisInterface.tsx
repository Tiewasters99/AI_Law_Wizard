'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '../ui/use-toast'
import { useDocumentProcessingStore } from '../../stores/documentProcessingStore'
import { useUIStore } from '../../stores/uiStore'

// Components
import { AnalysisHeader } from './components/AnalysisHeader'
import { TabNavigation } from './components/TabNavigation'
import { AnalysisInput } from './components/AnalysisInput'
import { ProcessingIndicator } from './components/ProcessingIndicator'
import { ResultDisplay } from './components/ResultDisplay'
import { ErrorDisplay } from './components/ErrorDisplay'
import { ChatSection } from './components/ChatSection'
import { ProcessedFilesList } from './ProcessedFilesList'
import OneDriveInterface from '../OneDriveInterface'
import { DocumentLibrary } from './DocumentLibrary'
import { QueryHistoryDashboard } from './QueryHistoryDashboard'

// Utils
import { createDocumentAnalysisSession } from './utils/sessionUtils'
import { animationVariants } from './utils/constants'

interface DocumentAnalysisInterfaceProps {
  onComplete?: (result: string, generatedFile: string) => void
  onBeforeStart?: () => Promise<boolean> | boolean
}

export function DocumentAnalysisInterface({
  onComplete,
  onBeforeStart
}: DocumentAnalysisInterfaceProps) {
  // Zustand stores
  const {
    isProcessing,
    finalResult,
    processedFiles,
    error,
    confidence,
    processingTime,
    currentStep,
    totalSteps,
    chatSessionId,
    documentSessionId,
    startProcessing,
    stopProcessing,
    clearState,
    resetError,
    setSessionIds
  } = useDocumentProcessingStore()

  const {
    activeTab,
    showChatMode,
    setActiveTab,
    toggleChatMode
  } = useUIStore()

  // Local state
  const [userPrompt, setUserPrompt] = useState('')
  const { toast } = useToast()

  // Create document analysis session
  const handleCreateSession = useCallback(async () => {
    if (!userPrompt || !finalResult) return

    const sessionId = await createDocumentAnalysisSession({
      userPrompt,
      processedFiles,
      analysisResult: finalResult
    })

    if (sessionId) {
      setSessionIds(sessionId, sessionId)
      toast({
        title: 'Chat Session Ready',
        description: 'You can now ask follow-up questions'
      })
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create chat session',
        variant: 'destructive'
      })
    }
  }, [userPrompt, finalResult, processedFiles, setSessionIds, toast])

  // Handle processing completion
  useEffect(() => {
    if (!isProcessing && finalResult && !error) {
      toast({
        title: 'Analysis Complete',
        description: `Successfully processed ${processedFiles.length || 0} relevant documents`
      })

      // Auto-create session for chat
      if (!documentSessionId && userPrompt && finalResult) {
        handleCreateSession()
      }

      onComplete?.(finalResult, finalResult)
    }
  }, [isProcessing, finalResult, error, processedFiles.length, documentSessionId, handleCreateSession, onComplete, toast, userPrompt])

  // Handle error display
  useEffect(() => {
    if (error) {
      const shouldShowToast = !error.includes('Connection') &&
        !error.includes('fetch') &&
        !error.includes('Invalid request')

      if (shouldShowToast) {
        let errorTitle = 'Analysis Failed'
        let errorDescription = error

        if (error.includes('No relevant documents found')) {
          errorTitle = 'No Documents Found'
          errorDescription = 'No relevant documents found. Try rephrasing or upload more documents.'
        } else if (error.includes('Processing timeout')) {
          errorTitle = 'Processing Timeout'
          errorDescription = 'Analysis took too long. Please try with a simpler request.'
        }

        toast({
          title: errorTitle,
          description: errorDescription,
          variant: 'destructive'
        })
      }
    }
  }, [error, toast])

  // Start analysis
  const handleStartAnalysis = useCallback(async () => {
    if (isProcessing) return

    if (!userPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please describe what you would like to analyze',
        variant: 'destructive'
      })
      return
    }

    // Check token requirements
    if (onBeforeStart) {
      try {
        const canProceed = await onBeforeStart()
        if (!canProceed) return
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to validate requirements',
          variant: 'destructive'
        })
        return
      }
    }

    // Clear previous state
    clearState()

    toast({
      title: 'Starting Analysis',
      description: 'Processing your request...'
    })

    // Start processing
    await startProcessing({ userPrompt: userPrompt.trim() })
  }, [isProcessing, userPrompt, onBeforeStart, clearState, toast, startProcessing])

  // Handle new analysis
  const handleNewAnalysis = useCallback(() => {
    setUserPrompt('')
    clearState()
    setSessionIds(null, null)
  }, [clearState, setSessionIds])

  // Handle continue chat
  const handleContinueChat = useCallback(async () => {
    if (!chatSessionId) {
      await handleCreateSession()
    }
    toggleChatMode()
  }, [chatSessionId, handleCreateSession, toggleChatMode])

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'analysis':
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Analysis Input */}
            {!finalResult && !isProcessing && (
              <AnalysisInput
                userPrompt={userPrompt}
                onPromptChange={setUserPrompt}
                onSubmit={handleStartAnalysis}
                isProcessing={isProcessing}
              />
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <ProcessingIndicator
                currentStep={currentStep}
                totalSteps={totalSteps}
                message="Analyzing documents and generating insights"
              />
            )}

            {/* Error Display */}
            {error && !isProcessing && (
              <ErrorDisplay
                error={error}
                onRetry={handleStartAnalysis}
                onDismiss={resetError}
              />
            )}

            {/* Result Display */}
            {finalResult && !isProcessing && !error && (
              <>
                <ResultDisplay
                  result={finalResult}
                  confidence={confidence}
                  processingTime={processingTime}
                  onContinueChat={handleContinueChat}
                  onNewAnalysis={handleNewAnalysis}
                />

                {/* Chat Section */}
                <ChatSection
                  show={showChatMode}
                  onClose={toggleChatMode}
                  sessionId={chatSessionId}
                  processedFiles={processedFiles}
                  onSessionCreate={(id) => setSessionIds(documentSessionId, id)}
                />

                {/* Processed Files */}
                {processedFiles.length > 0 && (
                  <ProcessedFilesList
                    processedFiles={processedFiles}
                    title="Relevant Documents"
                  />
                )}
              </>
            )}
          </div>
        )

      case 'files':
        return (
          <div className="space-y-4 sm:space-y-6">
            <OneDriveInterface />
          </div>
        )

      case 'history':
        return (
          <div className="space-y-4 sm:space-y-6">
            <QueryHistoryDashboard />
          </div>
        )

      case 'library':
        return (
          <div className="space-y-4 sm:space-y-6">
            <DocumentLibrary />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50"
      variants={animationVariants.page}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Header */}
      <motion.div
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200/50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <AnalysisHeader />
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Tab Content - Full Width */}
        {renderTabContent()}
      </div>
    </motion.div>
  )
}

