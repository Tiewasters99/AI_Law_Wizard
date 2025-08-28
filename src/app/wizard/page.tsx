'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { File, FileText, Image, Video, X, AlertCircle, FolderOpen, RefreshCw, Database, Brain, ArrowRight, CheckCircle, Play, Cloud, Trash2, Plus } from 'lucide-react'
import { GrokProcessingInterface } from '../components/grok-processing/GrokProcessingInterface'
import { useRouter } from 'next/navigation'



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
    router.push('/onedrive')
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
        return <CheckCircle className={`${baseClasses} text-green-600`} />
      case 'current':
        return <Play className={`${baseClasses} text-blue-600`} />
      default:
        return <div className={`${baseClasses} rounded-full border-2 border-gray-300 bg-gray-100`} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">AI Document Analysis</h1>
            <p className="text-xl text-gray-600">Run powerful AI analysis on your synced documents</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {(['files', 'analyze'] as StepType[]).map((step, index) => {
              const status = getStepStatus(step)
              const isLast = index === 1
              
              return (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-200 shadow-sm">
                      {getStepIcon(step, status)}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${
                        status === 'completed' ? 'text-green-600' :
                        status === 'current' ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {step === 'files' && 'Document Library'}
                        {step === 'analyze' && 'AI Analysis'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {step === 'files' && `${getAllFiles().length} files synced`}
                        {step === 'analyze' && grokResult ? 'Completed' : 'Ready'}
                      </p>
                    </div>
                  </div>
                  {!isLast && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      status === 'completed' ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Step 1: Document Library */}
          {currentStep === 'files' && (
            <div className="space-y-6">
              {getAllFiles().length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="text-center py-16">
                    <FolderOpen className="w-20 h-20 mx-auto text-gray-400 mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No Documents Found</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      You need to sync some documents first before you can start AI analysis. Use the Storage Hub to connect your cloud storage or upload files.
                    </p>
                    <Button
                      onClick={navigateToCloudStorage}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Cloud className="w-5 h-5 mr-2" />
                      Go to Storage Hub
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Quick Start Analysis */}
                  <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-green-900">
                        <Play className="w-6 h-6 mr-2" />
                        Ready to Analyze Your Documents
                      </CardTitle>
                      <CardDescription className="text-green-700">
                        {getAllFiles().length} documents are processed and ready for AI analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-green-900">Start analyzing now</p>
                          <p className="text-sm text-green-700">
                            Ask questions, extract insights, or generate summaries from your documents
                          </p>
                        </div>
                        <Button
                          onClick={() => setCurrentStep('analyze')}
                          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3"
                          size="lg"
                        >
                          <Brain className="w-5 h-5 mr-2" />
                          Start AI Analysis
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sync More Files */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-blue-900">
                        <Plus className="w-5 h-5 mr-2" />
                        Need More Documents?
                      </CardTitle>
                      <CardDescription className="text-blue-700">
                        Add more files from cloud storage or upload directly to enhance your analysis.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-800 mb-1">
                            • Sync from OneDrive, Google Drive, Dropbox, and more
                          </p>
                          <p className="text-sm text-blue-800 mb-1">
                            • Upload files directly from your computer
                          </p>
                          <p className="text-sm text-blue-800">
                            • Manage and organize all your documents in one place
                          </p>
                        </div>
                        <Button
                          onClick={navigateToCloudStorage}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Cloud className="w-4 h-4 mr-2" />
                          Storage Hub
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* File Library */}
              {getAllFiles().length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Database className="w-5 h-5 mr-2" />
                          Your Document Library
                        </CardTitle>
                        <CardDescription>
                          {getAllFiles().length} document(s) ready for AI analysis
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getAllFiles().length > 0 && (
                          <>
                            <Button
                              onClick={handleSelectAll}
                              variant="outline"
                              size="sm"
                            >
                              {selectedFiles.length === getAllFiles().length ? 'Deselect All' : 'Select All'}
                            </Button>
                            {selectedFiles.length > 0 && (
                              <Button
                                onClick={handleDeleteSelected}
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete ({selectedFiles.length})
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          onClick={fetchServerFiles}
                          disabled={isLoadingFiles}
                          variant="outline"
                          size="sm"
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                          Refresh
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getAllFiles().slice(-6).map((file) => {
                        const isSelected = selectedFiles.includes(file.fileName)
                        return (
                          <div
                            key={file.fileName}
                            className={`p-4 border rounded-lg bg-white hover:shadow-md transition-all cursor-pointer ${
                              isSelected ? 'border-blue-500 bg-blue-50' : ''
                            }`}
                            onClick={() => handleFileSelect(file.fileName)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleFileSelect(file.fileName)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                {getFileIcon(file)}
                                <Badge className="bg-green-100 text-green-800">
                                  Synced
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteServerFile(file.fileName)
                                }}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm mb-1 truncate">
                                {file.originalName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)} • Synced {new Date(file.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    {getAllFiles().length > 6 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                          Showing 6 of {getAllFiles().length} files
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              {getAllFiles().length > 0 && (
                <div className="text-center">
                  <Button
                    onClick={() => setCurrentStep('analyze')}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Continue to AI Analysis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: AI Analysis */}
          {currentStep === 'analyze' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Brain className="w-6 h-6 mr-3" />
                    Step 2: AI Document Analysis
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Use AI Wizard to analyze your documents. The AI will automatically find relevant content and provide insights.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getAllFiles().length === 0 ? (
                    <div className="text-center py-12">
                      <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No documents available</h3>
                      <p className="text-gray-500 mb-4">Sync some documents first to start AI analysis</p>
                      <Button
                        onClick={() => setCurrentStep('files')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Go Back to Files
                      </Button>
                    </div>
                  ) : (
                    <GrokProcessingInterface
                      onComplete={(result, generatedFile) => {
                        setGrokResult(result)
                      }}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => setCurrentStep('files')}
                  variant="outline"
                  size="lg"
                >
                  ← Back to Files
                </Button>
                
                {grokResult && (
                  <Button
                    onClick={() => {
                      setCurrentStep('files')
                      setGrokResult(null)
                    }}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Start New Analysis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-800">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default WizardPage