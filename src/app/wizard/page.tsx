'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { File, Upload, FileText, Image, Video, X, AlertCircle, FolderOpen, RefreshCw, Search, Database, Brain, ArrowRight, CheckCircle, Play } from 'lucide-react'
import { GrokProcessingInterface } from '../components/grok-processing/GrokProcessingInterface'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: 'uploading' | 'uploaded' | 'error'
  error?: string
  fileName?: string
  path?: string
}

interface ServerFile {
  id: string
  fileName: string
  originalName: string
  size: number
  uploadedAt: string
  modifiedAt: string
  path: string
}

type StepType = 'upload' | 'analyze'

const WizardPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [serverFiles, setServerFiles] = useState<ServerFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<StepType>('upload')
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [grokResult, setGrokResult] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        setUploadedFiles(prev => prev.filter(file => file.fileName !== fileName))
      } else {
        throw new Error(data.error || 'Failed to delete file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete file')
    }
  }

  // File upload handlers
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading'
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
    uploadFiles(Array.from(selectedFiles))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = e.dataTransfer.files
    handleFileSelect(droppedFiles)
  }

  const uploadFiles = async (files: File[]) => {
    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('files', file)

        const uploadResponse = await fetch('/api/embedding', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file')
        }

        const uploadData = await uploadResponse.json()
        
        if (!uploadData.success || !uploadData.files || uploadData.files.length === 0) {
          throw new Error(uploadData.error || 'Upload failed')
        }

        const uploadedFile = uploadData.files[0]
        
        setUploadedFiles(prev => prev.map(f => 
          f.name === file.name 
            ? { 
                ...f, 
                status: 'uploaded' as const, 
                fileName: uploadedFile.fileName,
                path: uploadedFile.path
              }
            : f
        ))

        fetchServerFiles()

      } catch (error) {
        console.error('Error uploading file:', error)
        setUploadedFiles(prev => prev.map(f => 
          f.name === file.name 
            ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Failed to upload file' }
            : f
        ))
      }
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const getUploadedFileIcon = (file: UploadedFile | ServerFile) => {
    const fileName = 'type' in file ? file.name : file.fileName
    const fileType = 'type' in file ? file.type : getFileTypeFromName(fileName)
    
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

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'bg-yellow-100 text-yellow-800'
      case 'uploaded':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
    const uploadedFileNames = new Set(uploadedFiles.map(f => f.fileName).filter(Boolean))
    const serverFilesFiltered = serverFiles.filter(f => !uploadedFileNames.has(f.fileName))
    return [...uploadedFiles, ...serverFilesFiltered]
  }

  const getStepStatus = (step: StepType) => {
    switch (step) {
      case 'upload':
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
            <h1 className="text-4xl font-bold text-gray-900 mb-3">AI Document Wizard</h1>
            <p className="text-xl text-gray-600">Upload documents and analyze them with AI</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {(['upload', 'analyze'] as StepType[]).map((step, index) => {
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
                        {step === 'upload' && 'Upload Files'}
                        {step === 'analyze' && 'AI Analysis'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {step === 'upload' && `${getAllFiles().length} files`}
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
          {/* Step 1: Upload Files */}
          {currentStep === 'upload' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Upload className="w-6 h-6 mr-3" />
                    Step 1: Upload Your Documents
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Start by uploading your documents. They&apos;ll be automatically processed and indexed for AI-powered analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                      isDragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-16 h-16 mx-auto text-gray-400 mb-6" />
                    <p className="text-xl font-medium text-gray-900 mb-3">
                      Drop files here or click to browse
                    </p>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Supported formats: PDF, DOC, DOCX, TXT, RTF, ODT, Images (JPEG, PNG, GIF, WebP), Excel, CSV, JSON
                    </p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Choose Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.jpg,.jpeg,.png,.gif,.webp,.xls,.xlsx,.csv,.json"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* File Library */}
              {getAllFiles().length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <FolderOpen className="w-5 h-5 mr-2" />
                          Your Document Library
                        </CardTitle>
                        <CardDescription>
                          {getAllFiles().length} document(s) ready for AI analysis
                        </CardDescription>
                      </div>
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
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getAllFiles().slice(-6).map((file) => (
                        <div
                          key={'id' in file ? file.id : (file as ServerFile).fileName}
                          className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getUploadedFileIcon(file)}
                              {'status' in file ? (
                                <Badge className={getStatusColor(file.status)}>
                                  {file.status}
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800">
                                  uploaded
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if ('status' in file) {
                                  removeFile(file.id)
                                } else {
                                  deleteServerFile(file.fileName)
                                }
                              }}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm mb-1 truncate">
                              {'name' in file ? file.name : file.originalName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                      ))}
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

              {/* Next Step Button */}
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
                    Use Grok AI to analyze your documents. The AI will automatically find relevant content and provide insights.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getAllFiles().length === 0 ? (
                    <div className="text-center py-12">
                      <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No documents available</h3>
                      <p className="text-gray-500 mb-4">Upload some documents first to start AI analysis</p>
                      <Button
                        onClick={() => setCurrentStep('upload')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Go Back to Upload
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
                  onClick={() => setCurrentStep('upload')}
                  variant="outline"
                  size="lg"
                >
                  ← Back to Upload
                </Button>
                
                {grokResult && (
                  <Button
                    onClick={() => {
                      setCurrentStep('upload')
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