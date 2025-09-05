'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { File, FileText, Image, Video, X, AlertCircle, FolderOpen, RefreshCw, Database, Brain, ArrowRight, CheckCircle, Play, Cloud, Trash2, Plus, HelpCircle, FileCheck, Zap, Upload } from 'lucide-react'
import { GrokProcessingInterface } from '../components/document-processing/GrokProcessingInterface'
import { useRouter } from 'next/navigation'
import Layout from '../components/Layout'



interface ServerFile {
  id: string
  fileName: string
  originalName: string
  size: number
  uploadedAt: string
  modifiedAt: string
  path: string
}

type StepType = 'files' | 'analyze'

const WizardPage = () => {
  const [serverFiles, setServerFiles] = useState<ServerFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<StepType>('files')
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [grokResult, setGrokResult] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const router = useRouter()

  // Fetch files from server when component mounts
  useEffect(() => {
    fetchServerFiles()
  }, [])

  const fetchServerFiles = async () => {
    setIsLoadingFiles(true)
    setError(null)
    
    try {
      const response = await fetch('/api/files')
      
      if (!response.ok) {
        throw new Error('Failed to fetch files from server')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setServerFiles(data.files || [])
      } else {
        throw new Error(data.error || 'Failed to fetch files')
      }
    } catch (error) {
      console.error('Error fetching server files:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch files')
    } finally {
      setIsLoadingFiles(false)
    }
  }

  const deleteServerFile = async (fileName: string) => {
    try {
      const response = await fetch(`/api/files?fileName=${encodeURIComponent(fileName)}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete file')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setServerFiles(prev => prev.filter(file => file.fileName !== fileName))
        setSelectedFiles(prev => prev.filter(id => id !== fileName))
      } else {
        throw new Error(data.error || 'Failed to delete file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete file')
    }
  }

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === serverFiles.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(serverFiles.map(f => f.fileName))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return

    try {
      for (const fileName of selectedFiles) {
        await deleteServerFile(fileName)
      }
      setSelectedFiles([])
    } catch (error) {
      console.error('Error deleting selected files:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete selected files')
    }
  }

  const navigateToCloudStorage = () => {
    router.push('/integrations')
  }

  const getFileIcon = (file: ServerFile) => {
    const fileType = getFileTypeFromName(file.fileName)
    
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const getFileTypeFromName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf': return 'application/pdf'
      case 'doc': case 'docx': return 'application/msword'
      case 'txt': return 'text/plain'
      case 'jpg': case 'jpeg': return 'image/jpeg'
      case 'png': return 'image/png'
      case 'gif': return 'image/gif'
      case 'webp': return 'image/webp'
      case 'xls': case 'xlsx': return 'application/vnd.ms-excel'
      case 'csv': return 'text/csv'
      case 'json': return 'application/json'
      default: return 'application/octet-stream'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getAllFiles = () => {
    return serverFiles
  }

  const getStepStatus = (step: StepType) => {
    switch (step) {
      case 'files':
        return getAllFiles().length > 0 ? 'completed' : 'current'
      case 'analyze':
        return grokResult ? 'completed' : currentStep === 'analyze' ? 'current' : 'pending'
      default:
        return 'pending'
    }
  }

  const getStepIcon = (step: StepType, status: string) => {
    const baseClasses = "w-6 h-6"
    switch (status) {
      case 'completed':
        return <CheckCircle className={`${baseClasses} text-white`} />
      case 'current':
        return <Play className={`${baseClasses} text-white`} />
      default:
        return <div className={`${baseClasses} rounded-full border-2 border-gray-400 bg-gray-200`} />
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Modern Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            AI Document Wizard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your documents into actionable insights with powerful AI analysis
          </p>
        </div>

        {/* Enhanced Progress Steps */}
        <div className="mb-12">
          <div className="relative">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {(['files', 'analyze'] as StepType[]).map((step, index) => {
                const status = getStepStatus(step)
                const isLast = index === 1
                
                return (
                  <div key={step} className="flex items-center">
                    <div className="relative">
                      <div className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
                        status === 'completed' ? 'bg-green-500 shadow-lg shadow-green-200' :
                        status === 'current' ? 'bg-blue-500 shadow-lg shadow-blue-200 scale-110' : 
                        'bg-gray-200'
                      }`}>
                        {getStepIcon(step, status)}
                      </div>
                      {status === 'current' && (
                        <div className="absolute -inset-1 bg-blue-500 rounded-full animate-pulse opacity-30"></div>
                      )}
                    </div>
                    <div className="ml-4 text-left">
                      <p className={`font-semibold transition-colors duration-300 ${
                        status === 'completed' ? 'text-green-700' :
                        status === 'current' ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {step === 'files' && 'Sync Documents'}
                        {step === 'analyze' && 'AI Analysis'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {step === 'files' && `${getAllFiles().length} files ready`}
                        {step === 'analyze' && (grokResult ? 'Analysis complete' : 'Ready to analyze')}
                      </p>
                    </div>
                    {!isLast && (
                      <div className={`flex-1 h-1 mx-6 rounded-full transition-colors duration-300 ${
                        status === 'completed' ? 'bg-green-400' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Step 1: Document Library */}
          {currentStep === 'files' && (
            <div className="space-y-8">
              {getAllFiles().length === 0 ? (
                <div className="text-center py-20">
                  <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
                      <FolderOpen className="w-16 h-16 text-blue-500" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
                  <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                    Sync your documents from cloud storage or upload files directly to begin your AI-powered analysis journey.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                      onClick={navigateToCloudStorage}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Cloud className="w-5 h-5 mr-2" />
                      Connect Cloud Storage
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                  
                  <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <Cloud className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Cloud Integration</h4>
                      <p className="text-sm text-gray-600">Connect OneDrive, Google Drive, Dropbox and more</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                        <Brain className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">AI Analysis</h4>
                      <p className="text-sm text-gray-600">Powerful insights from your documents using AI</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Instant Results</h4>
                      <p className="text-sm text-gray-600">Get answers and insights in seconds</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Quick Start Analysis - Enhanced */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                          <FileCheck className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-green-900 mb-2">
                            {getAllFiles().length} Documents Ready
                          </h3>
                          <p className="text-green-700 mb-4 max-w-md">
                            Your documents have been processed and are ready for AI analysis. 
                            Start asking questions or request insights from your content.
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-green-600">
                            <span className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Processed
                            </span>
                            <span className="flex items-center">
                              <Brain className="w-4 h-4 mr-1" />
                              AI Ready
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => setCurrentStep('analyze')}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        size="lg"
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        Start Analysis
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Add More Files - Simplified */}
                  <div className="flex items-center justify-center py-6">
                    <Button
                      onClick={navigateToCloudStorage}
                      variant="outline"
                      className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700 px-6 py-3 rounded-xl transition-all duration-300"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add More Documents
                    </Button>
                  </div>
                </div>
              )}

              {/* Enhanced Navigation */}
              {getAllFiles().length > 0 && (
                <div className="text-center py-8">
                  <div className="space-y-4">
                    <p className="text-gray-600">Ready to unlock insights from your documents?</p>
                    <Button
                      onClick={() => setCurrentStep('analyze')}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Brain className="w-5 h-5 mr-2" />
                      Start AI Analysis
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Enhanced AI Analysis */}
          {currentStep === 'analyze' && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                  <div className="flex items-center text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">AI Document Analysis</h2>
                      <p className="text-blue-100">
                        Ask questions, extract insights, and get summaries from your {getAllFiles().length} documents
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  {getAllFiles().length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
                        <FolderOpen className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">No Documents Available</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        You need to sync some documents first before starting AI analysis. 
                        Go back to add your files.
                      </p>
                      <Button
                        onClick={() => setCurrentStep('files')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl"
                      >
                        <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                        Back to Documents
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <HelpCircle className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="font-semibold text-blue-900">Need help getting started?</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                          <div className="space-y-2">
                            <p>• "Summarize the key points from all documents"</p>
                            <p>• "What are the main themes discussed?"</p>
                            <p>• "Find information about [specific topic]"</p>
                          </div>
                          <div className="space-y-2">
                            <p>• "Extract all action items and deadlines"</p>
                            <p>• "Compare different viewpoints presented"</p>
                            <p>• "Generate a comprehensive report"</p>
                          </div>
                        </div>
                      </div>
                      
                      <GrokProcessingInterface
                        onComplete={(result, generatedFile) => {
                          setGrokResult(result)
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => setCurrentStep('files')}
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 hover:border-gray-400 px-8 py-3 rounded-xl"
                >
                  <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                  Back to Documents
                </Button>
                
                {grokResult && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Analysis Complete</span>
                    </div>
                    <Button
                      onClick={() => {
                        setCurrentStep('files')
                        setGrokResult(null)
                      }}
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      New Analysis
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">Something went wrong</h3>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
                <Button
                  onClick={() => setError(null)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default WizardPage