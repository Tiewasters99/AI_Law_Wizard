'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  BarChart3,
  Brain,
  CheckCircle,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileIcon,
  FileText,
  Folder,
  History,
  Info,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RefreshCw,
  Save,
  Settings,
  Timer,
  Upload,
  Wind,
  X,
  Zap
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Textarea } from '../ui/textarea'
import { useToast } from '../ui/use-toast'

// Import real-time processing hook
import ReactMarkdown from 'react-markdown'
import { useDocumentProcessing } from '../../hooks/useDocumentProcessing'
import { useQueryHistory } from '../../hooks/useQueryHistory'
import OneDriveInterface from '../OneDriveInterface'
import { DocumentLibrary } from './DocumentLibrary'
import { LargeFileUploadHandler } from './LargeFileUploadHandler'
import { ProcessedFilesList } from './ProcessedFilesList'

interface ProcessedFileInfo {
  fileId: string
  fileName: string
  originalName: string
  fileSize: number
  downloadUrl?: string
  fileType?: string
  jobId?: string
  totalChunks?: number
  processedChunks?: number
  isOneDriveFile?: boolean
  oneDriveId?: string | null
}

interface UnifiedDocumentWizardProps {
  onComplete?: (result: string, generatedFile: string) => void
  onBeforeStart?: () => Promise<boolean> | boolean
}

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -30, scale: 0.95 }
}

const tabVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}

const buttonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
}

const loadingVariants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
}

export function DocumentAnalysisInterface({ onComplete, onBeforeStart }: UnifiedDocumentWizardProps) {
  // Input state
  const [userPrompt, setUserPrompt] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // UI state
  const [showFileEditor, setShowFileEditor] = useState(false)
  const [editedFile, setEditedFile] = useState('')
  const [generatedFile, setGeneratedFile] = useState('')
  const [showFileManager, setShowFileManager] = useState(false)
  const [showQueryHistory, setShowQueryHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<'analysis' | 'files' | 'history' | 'library'>('analysis')
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('single')
  
  // Result viewing state
  const [selectedQuery, setSelectedQuery] = useState<any>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())
  const [resultViewMode, setResultViewMode] = useState<'summary' | 'detailed'>('summary')
  
  // Real-time processing hook
  const processingState = useDocumentProcessing()
  const queryHistory = useQueryHistory()
  
  const { toast } = useToast()
  const fileEditorRef = useRef<HTMLTextAreaElement>(null)
  
  // Determine current processing state
  const isProcessing = processingState.isProcessing
  const finalResult = processingState.finalResult || ''
  const processedFiles = processingState.processedFiles

  // Load recent queries on mount
  useEffect(() => {
    queryHistory.fetchRecentQueries(5)
  }, [])

  // Debug processed files
  useEffect(() => {
    if (processedFiles && processedFiles.length > 0) {
      console.log('ProcessedFiles in component:', processedFiles)
    }
  }, [processedFiles])

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
    a.download = `ai_analysis_report_${Date.now()}.txt`
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

  const handleFileSelect = (file: File) => {
    toast({
      title: 'File Selected',
      description: `Selected file: ${file.name}`
    })
  }

  const handleFileSync = (files: any[]) => {
    toast({
      title: 'Files Synced',
      description: `Successfully synced ${files.length} files to the AI analysis system`
    })
  }

  const handleBulkUploadComplete = (results: any) => {
    toast({
      title: 'Bulk Upload Complete',
      description: `Successfully processed ${results.files?.length || 0} files`
    })
  }

  const handleBulkUploadError = (error: string) => {
    toast({
      title: 'Bulk Upload Error',
      description: error,
      variant: 'destructive'
    })
  }

  const handleQuerySelect = (query: any) => {
    setUserPrompt(query.userQuery)
    setActiveTab('analysis')
    toast({
      title: 'Query Loaded',
      description: 'Previous query loaded into the analysis field'
    })
  }

  const handleViewResult = (query: any) => {
    setSelectedQuery(query)
    setShowResultModal(true)
  }

  const handleCopyResult = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied',
      description: 'Result copied to clipboard'
    })
  }

  const toggleResultExpansion = (queryId: string) => {
    const newExpanded = new Set(expandedResults)
    if (newExpanded.has(queryId)) {
      newExpanded.delete(queryId)
    } else {
      newExpanded.add(queryId)
    }
    setExpandedResults(newExpanded)
  }

  const formatProcessingTime = (time: number) => {
    if (time < 1000) return `${time}ms`
    return `${(time / 1000).toFixed(1)}s`
  }

  const getResponseModeIcon = (mode: string) => {
    switch (mode) {
      case 'question_answering':
        return <Zap className="w-4 h-4 text-blue-500" />
      case 'action_performance':
        return <Edit3 className="w-4 h-4 text-green-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getResponseModeLabel = (mode: string) => {
    switch (mode) {
      case 'question_answering':
        return 'Question Answering'
      case 'action_performance':
        return 'Action Performance'
      default:
        return 'Unknown Mode'
    }
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div 
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200/50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo Icon */}
            <motion.div 
              className="flex items-center"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
                  animate={{ 
                    rotate: [0, 1, -1, 0],
                    scale: [1, 1.01, 1]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatDelay: 5
                  }}
                >
                  <FileText className="w-5 h-5 text-white" />
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                />
              </motion.div>
            </motion.div>
            
            {/* Tab Navigation */}
            <motion.div 
              className="flex items-center space-x-1 bg-slate-50/90 rounded-xl p-1.5 border border-slate-200/50"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('analysis')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                    activeTab === 'analysis' 
                      ? 'bg-white shadow-sm text-blue-600 border border-blue-200/50' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 hover:border-blue-200/30'
                  }`}
                >
                  <Wind className="w-4 h-4" />
                  <span className="hidden sm:inline">Analysis</span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('files')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                    activeTab === 'files' 
                      ? 'bg-white shadow-sm text-blue-600 border border-blue-200/50' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 hover:border-blue-200/30'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span className="hidden sm:inline">Files</span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                    activeTab === 'history' 
                      ? 'bg-white shadow-sm text-blue-600 border border-blue-200/50' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 hover:border-blue-200/30'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">History</span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('library')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                    activeTab === 'library' 
                      ? 'bg-white shadow-sm text-blue-600 border border-blue-200/50' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 hover:border-blue-200/30'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Library</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-4 sm:py-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Main Analysis Interface */}
          <motion.div 
            className="space-y-4 sm:space-y-6"
            layout
          >
            {/* Analysis Tab */}
            <AnimatePresence mode="wait">
              {activeTab === 'analysis' && (
                <motion.div
                  key="analysis"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <motion.div
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover={{ y: -2, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                        <CardTitle className="flex items-center space-x-2">
                          <motion.div
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                          >
                            <Wind className="w-5 h-5 text-blue-600" />
                          </motion.div>
                          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            AI Document Analysis
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 p-6">
                        {/* Search Input */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        >
                          <label className="block text-lg font-medium mb-4 text-gray-900">
                            What would you like to analyze? *
                          </label>
                          <motion.div
                            whileFocus={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Textarea
                              value={userPrompt}
                              onChange={(e) => setUserPrompt(e.target.value)}
                              placeholder="Describe what you want to analyze, extract, or understand from your documents..."
                              rows={4}
                              disabled={isProcessing}
                              className="text-base sm:text-lg resize-none border-2 border-gray-200 focus:border-blue-500 rounded-xl p-3 sm:p-4 shadow-sm transition-all duration-300 focus:shadow-lg"
                            />
                          </motion.div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div 
                          className="flex flex-col sm:flex-row gap-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1"
                          >
                            <Button 
                              onClick={handleProcess} 
                              disabled={isProcessing || !userPrompt.trim()}
                              className="flex-1 h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              size="lg"
                            >
                              {isProcessing ? (
                                <motion.div 
                                  className="flex items-center"
                                  variants={loadingVariants}
                                  animate="animate"
                                >
                                  <div className="w-5 h-5 mr-3 flex items-center justify-center">
                                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                  </div>
                                  Processing...
                                </motion.div>
                              ) : (
                                <>
                                  <Play className="w-5 h-5 mr-3" />
                                  Start Analysis
                                </>
                              )}
                            </Button>
                          </motion.div>

                          <AnimatePresence>
                            {isProcessing && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                                whileHover={buttonVariants.hover}
                                whileTap={buttonVariants.tap}
                              >
                                <Button 
                                  onClick={handleStopProcessing}
                                  variant="outline"
                                  size="lg"
                                  className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-300"
                                >
                                  <Pause className="w-5 h-5 mr-2" />
                                  Stop
                                </Button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        {/* Processing Indicator */}
                        <AnimatePresence>
                          {isProcessing && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -20 }}
                              transition={{ duration: 0.5 }}
                              className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl py-8 px-6 shadow-lg"
                            >
                              <div className="flex flex-col items-center justify-center space-y-4">
                                <motion.div
                                  animate={{ 
                                    rotate: 360,
                                    scale: [1, 1.1, 1]
                                  }}
                                  transition={{ 
                                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                                  }}
                                >
                                  <Loader2 className="w-12 h-12 text-blue-600" />
                                </motion.div>
                                <motion.div 
                                  className="text-center"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <h3 className="text-xl font-semibold text-blue-900 mb-2">Processing your request...</h3>
                                  <p className="text-blue-700">
                                    Analyzing documents and generating insights
                                  </p>
                                </motion.div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Final Result */}
                        <AnimatePresence>
                          {finalResult && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: 30 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -30 }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg"
                            >
                              <motion.div 
                                className="flex items-center gap-3 mb-4"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                  <CheckCircle className="w-6 h-6 text-green-600" />
                                </motion.div>
                                <h3 className="text-xl font-semibold text-green-900">Analysis Result</h3>
                              </motion.div>
                              <motion.div 
                                className="bg-white p-6 rounded-xl border border-green-200 shadow-sm"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                              >
                                <div className="prose prose-sm max-w-none text-gray-800">
                                  <ReactMarkdown>{finalResult}</ReactMarkdown>
                                </div>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                  {/* Processed Files */}
                  {processedFiles && processedFiles.length > 0 && (
                    <ProcessedFilesList 
                      processedFiles={processedFiles}
                      title="Relevant Documents"
                    />
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
                </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Files Tab */}
            <AnimatePresence mode="wait">
              {activeTab === 'files' && (
                <motion.div
                  key="files"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Folder className="w-5 h-5" />
                      <span>File Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={uploadMode === 'single' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setUploadMode('single')}
                        className="flex items-center space-x-1"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Single</span>
                      </Button>
                      <Button
                        variant={uploadMode === 'bulk' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setUploadMode('bulk')}
                        className="flex items-center space-x-1"
                      >
                        <Folder className="w-4 h-4" />
                        <span>Bulk (30-40 files)</span>
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {uploadMode === 'single' ? (
                    <OneDriveInterface
                      onFileSelect={handleFileSelect}
                      onFileSync={handleFileSync}
                      showUpload={true}
                      showDownload={true}
                      showSync={true}
                      className="border-0 shadow-none"
                    />
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Folder className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-blue-900">Bulk File Processing</h3>
                        </div>
                        <p className="text-blue-700 text-sm">
                          Upload and process up to 40 files at once. Perfect for large document collections.
                        </p>
                      </div>
                      
                      <LargeFileUploadHandler
                        onUploadComplete={handleBulkUploadComplete}
                        onUploadError={handleBulkUploadError}
                        maxFiles={40}
                        maxTotalSize={500 * 1024 * 1024} // 500MB total
                        maxFileSize={20 * 1024 * 1024} // 20MB per file
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* History Tab */}
            <AnimatePresence mode="wait">
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <History className="w-5 h-5" />
                      <span>Query History</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => queryHistory.fetchRecentQueries(10)}
                      className="flex items-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh</span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {queryHistory.loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 flex items-center justify-center mr-3">
                        <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-gray-600">Loading history...</span>
                    </div>
                  ) : queryHistory.queries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No queries found</p>
                      <p className="text-sm">Start by asking a question about your documents</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {queryHistory.queries.map((query) => {
                        const isExpanded = expandedResults.has(query.id)
                        const hasResponse = query.success && query.aiResponse
                        
                        return (
                          <div
                            key={query.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                {/* Header with status and metadata */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    {query.success ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <X className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {new Date(query.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                    {query.processingTime && (
                                      <span className="text-xs text-gray-500 flex items-center">
                                        <Timer className="h-3 w-3 mr-1" />
                                        {formatProcessingTime(query.processingTime)}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Action buttons */}
                                  <div className="flex items-center space-x-2">
                                    {hasResponse && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewResult(query)}
                                        className="flex items-center space-x-1"
                                      >
                                        <Eye className="w-3 h-3" />
                                        <span>View</span>
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleQuerySelect(query)}
                                      className="flex items-center space-x-1"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      <span>Reuse</span>
                                    </Button>
                                  </div>
                                </div>

                                {/* Query content */}
                                <div className="mb-3">
                                  <div className="text-sm font-medium text-gray-900 mb-1 flex items-center">
                                    <FileText className="w-4 h-4 mr-1" />
                                    Query:
                                  </div>
                                  <div className="text-sm text-gray-700 bg-gray-100 rounded p-3">
                                    {query.userQuery}
                                  </div>
                                </div>

                                {/* Response preview */}
                                {hasResponse && (
                                  <div className="mb-3">
                                    <div className="text-sm font-medium text-gray-900 mb-1 flex items-center">
                                      <Brain className="w-4 h-4 mr-1" />
                                      Response:
                                    </div>
                                    <div className="text-sm text-gray-700 bg-blue-50 rounded p-3">
                                      {isExpanded ? (
                                        <div className="space-y-2">
                                          <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown>
                                              {query.aiResponse}
                                            </ReactMarkdown>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleResultExpansion(query.id)}
                                            className="text-xs"
                                          >
                                            <Minimize2 className="w-3 h-3 mr-1" />
                                            Show Less
                                          </Button>
                                        </div>
                                      ) : (
                                        <div>
                                          <div className="mb-2">
                                            {query.aiResponse.length > 200 
                                              ? query.aiResponse.substring(0, 200) + '...' 
                                              : query.aiResponse
                                            }
                                          </div>
                                          {query.aiResponse.length > 200 && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => toggleResultExpansion(query.id)}
                                              className="text-xs"
                                            >
                                              <ChevronRight className="w-3 h-3 mr-1" />
                                              Show More
                                            </Button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Error display */}
                                {!query.success && query.error && (
                                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                                    <div className="flex items-center mb-1">
                                      <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                                      <span className="text-sm font-medium text-red-900">Error</span>
                                    </div>
                                    <div className="text-sm text-red-700">{query.error}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Library Tab */}
            <AnimatePresence mode="wait">
              {activeTab === 'library' && (
                <motion.div
                  key="library"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <DocumentLibrary />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResultModal && selectedQuery && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-3">
                  <Brain className="w-6 h-6 text-blue-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Query Result Details</h2>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedQuery.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResultViewMode(resultViewMode === 'summary' ? 'detailed' : 'summary')}
                  >
                    {resultViewMode === 'summary' ? <Maximize2 className="w-4 h-4 mr-1" /> : <Minimize2 className="w-4 h-4 mr-1" />}
                    {resultViewMode === 'summary' ? 'Detailed' : 'Summary'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResultModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  {/* Query Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Original Query
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyResult(selectedQuery.userQuery)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800">{selectedQuery.userQuery}</p>
                    </div>
                  </div>

                  {/* Response Section */}
                  {selectedQuery.success && selectedQuery.aiResponse && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          <Brain className="w-5 h-5 mr-2" />
                          AI Response
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyResult(selectedQuery.aiResponse)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUserPrompt(selectedQuery.userQuery)
                              setShowResultModal(false)
                              setActiveTab('analysis')
                            }}
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Reuse Query
                          </Button>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {selectedQuery.aiResponse}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Processing Details */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Processing Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Status</span>
                            <div className="flex items-center">
                              {selectedQuery.success ? (
                                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                              ) : (
                                <X className="w-4 h-4 text-red-500 mr-1" />
                              )}
                              <span className="text-sm text-gray-900">
                                {selectedQuery.success ? 'Success' : 'Failed'}
                              </span>
                            </div>
                          </div>
                          
                          {selectedQuery.processingTime && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Processing Time</span>
                              <span className="text-sm text-gray-900 flex items-center">
                                <Timer className="w-4 h-4 mr-1" />
                                {formatProcessingTime(selectedQuery.processingTime)}
                              </span>
                            </div>
                          )}
                          
                          {selectedQuery.confidence && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Confidence</span>
                              <span className="text-sm text-gray-900 flex items-center">
                                <Zap className="w-4 h-4 mr-1" />
                                {Math.round(selectedQuery.confidence * 100)}%
                              </span>
                            </div>
                          )}
                          
                          {selectedQuery.totalSteps && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Steps</span>
                              <span className="text-sm text-gray-900 flex items-center">
                                <BarChart3 className="w-4 h-4 mr-1" />
                                {selectedQuery.completedSteps}/{selectedQuery.totalSteps}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2">
                          {selectedQuery.toolsUsed && selectedQuery.toolsUsed.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-gray-600 block mb-2">Tools Used</span>
                              <div className="flex flex-wrap gap-1">
                                {selectedQuery.toolsUsed.map((tool: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tool.replace('_', ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {selectedQuery.filesProcessed && (
                            <div>
                              <span className="text-sm font-medium text-gray-600 block mb-2">Files Processed</span>
                              <span className="text-sm text-gray-900">
                                {Array.isArray(selectedQuery.filesProcessed) 
                                  ? selectedQuery.filesProcessed.length 
                                  : 'Unknown'
                                } files
                                {Array.isArray(selectedQuery.filesProcessed) && selectedQuery.filesProcessed.length > 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    <div>
                                      {selectedQuery.filesProcessed.filter((f: any) => f.isOneDriveFile).length} from OneDrive
                                    </div>
                                    {(() => {
                                      const fileTypes = selectedQuery.filesProcessed.reduce((acc: any, file: any) => {
                                        const type = file.fileType?.split('/')[1]?.toUpperCase() || 'Unknown'
                                        acc[type] = (acc[type] || 0) + 1
                                        return acc
                                      }, {})
                                      const typeList = Object.entries(fileTypes).map(([type, count]) => `${count} ${type}`).join(', ')
                                      return typeList && <div>Types: {typeList}</div>
                                    })()}
                                  </div>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error Details */}
                  {!selectedQuery.success && selectedQuery.error && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                        Error Details
                      </h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{selectedQuery.error}</p>
                      </div>
                    </div>
                  )}

                  {/* Files Processed */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Folder className="w-5 h-5 mr-2" />
                      Files Processed
                      {selectedQuery.filesProcessed && Array.isArray(selectedQuery.filesProcessed) && (
                        <span className="ml-2 text-sm text-gray-500">({selectedQuery.filesProcessed.length})</span>
                      )}
                    </h3>
                    
                    {selectedQuery.filesProcessed && Array.isArray(selectedQuery.filesProcessed) && selectedQuery.filesProcessed.length > 0 ? (
                      <div className="space-y-3">
                        {selectedQuery.filesProcessed.map((file: any, index: number) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className="flex-shrink-0">
                                  {file.fileType === 'application/pdf' ? (
                                    <FileText className="w-5 h-5 text-red-500" />
                                  ) : file.fileType?.includes('word') || file.fileType?.includes('document') ? (
                                    <FileText className="w-5 h-5 text-blue-500" />
                                  ) : file.fileType?.includes('text') ? (
                                    <FileText className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <FileIcon className="w-5 h-5 text-gray-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {file.fileName || file.originalName || 'Unknown file'}
                                    </p>
                                    {file.isOneDriveFile && (
                                      <Badge variant="secondary" className="text-xs">
                                        OneDrive
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    {file.fileSize && (
                                      <span className="flex items-center">
                                        <FileIcon className="w-3 h-3 mr-1" />
                                        {Math.round(file.fileSize / 1024)}KB
                                      </span>
                                    )}
                                    {file.fileType && (
                                      <span className="flex items-center">
                                        <Settings className="w-3 h-3 mr-1" />
                                        {file.fileType.split('/')[1]?.toUpperCase() || 'Unknown'}
                                      </span>
                                    )}
                                    {file.totalChunks && (
                                      <span className="flex items-center">
                                        <BarChart3 className="w-3 h-3 mr-1" />
                                        {file.processedChunks || 0}/{file.totalChunks} chunks
                                      </span>
                                    )}
                                  </div>
                                  {file.jobId && (
                                    <div className="mt-1">
                                      <span className="text-xs text-gray-400">ID: {file.jobId}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-3">
                                {file.downloadUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(file.downloadUrl, '_blank')}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Open
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyResult(file.fileName || file.originalName || 'Unknown file')}
                                  className="text-gray-600 hover:text-gray-700"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <Folder className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          {selectedQuery.success 
                            ? 'No files were processed for this query' 
                            : 'Files processing information is not available'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
  )
}
