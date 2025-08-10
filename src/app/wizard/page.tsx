'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { File, Upload, FileText, Image, Video, X, AlertCircle, FolderOpen, RefreshCw, Search, Database } from 'lucide-react'

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

type TabType = 'upload' | 'files' | 'search'

const WizardPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [serverFiles, setServerFiles] = useState<ServerFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('upload')
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    score: number;
    metadata: Record<string, string | number | boolean>;
    rank: number;
  }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchStats, setSearchStats] = useState<{
    totalVectorCount: number;
    dimension: number;
    indexFullness: number;
    namespaces: Record<string, unknown>;
  } | null>(null)
  const [topK, setTopK] = useState(5)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch files from server when Files tab is active
  useEffect(() => {
    if (activeTab === 'files') {
      fetchServerFiles()
    }
  }, [activeTab])

  // Fetch search stats when Search tab is active
  useEffect(() => {
    if (activeTab === 'search') {
      fetchSearchStats()
    }
  }, [activeTab])

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

  const fetchSearchStats = async () => {
    try {
      const response = await fetch('/api/similarity-search')
      
      if (!response.ok) {
        throw new Error('Failed to fetch search stats')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setSearchStats(data.stats)
      } else {
        throw new Error(data.error || 'Failed to fetch search stats')
      }
    } catch (error) {
      console.error('Error fetching search stats:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch search stats')
    }
  }

  const performSimilaritySearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query')
      return
    }

    setIsSearching(true)
    setError(null)
    
    try {
      const response = await fetch('/api/similarity-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery.trim(),
          topK: topK
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to perform similarity search')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.results || [])
      } else {
        throw new Error(data.error || 'Failed to perform similarity search')
      }
    } catch (error) {
      console.error('Error performing similarity search:', error)
      setError(error instanceof Error ? error.message : 'Failed to perform similarity search')
    } finally {
      setIsSearching(false)
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
        // Remove file from local state
        setServerFiles(prev => prev.filter(file => file.fileName !== fileName))
        // Also remove from uploaded files if it exists there
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
        // Create FormData for file upload
        const formData = new FormData()
        formData.append('files', file)

        // Upload file to embedding API
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
        
        // Update file status to uploaded
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

        // Refresh server files list after successful upload
        if (activeTab === 'files') {
          fetchServerFiles()
        }

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

  const getFileTypeCategory = (file: UploadedFile | ServerFile) => {
    const fileName = 'type' in file ? file.name : file.fileName
    const fileType = 'type' in file ? file.type : getFileTypeFromName(fileName)
    
    if (fileType.startsWith('image/')) return 'Images'
    if (fileType.startsWith('video/')) return 'Videos'
    if (fileType.includes('pdf')) return 'Documents'
    if (fileType.includes('document') || fileType.includes('text')) return 'Documents'
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'Spreadsheets'
    return 'Other'
  }

  const getAllFiles = () => {
    // Combine uploaded files with server files, avoiding duplicates
    const uploadedFileNames = new Set(uploadedFiles.map(f => f.fileName).filter(Boolean))
    const serverFilesFiltered = serverFiles.filter(f => !uploadedFileNames.has(f.fileName))
    
    return [...uploadedFiles, ...serverFilesFiltered]
  }

  const groupedFiles = getAllFiles().reduce((acc, file) => {
    const category = getFileTypeCategory(file)
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(file)
    return acc
  }, {} as Record<string, (UploadedFile | ServerFile)[]>)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Wizard</h1>
            <p className="text-gray-600">AI-powered document processing and analysis</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload Files
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'files'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FolderOpen className="w-4 h-4 inline mr-2" />
                All Files ({getAllFiles().length})
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'search'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Search className="w-4 h-4 inline mr-2" />
                Vector Search
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <>
              {/* File Upload Area */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Files
                  </CardTitle>
                  <CardDescription>
                    Drag and drop files here or click to browse. Files will be securely stored on the server.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drop files here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Supported formats: PDF, DOC, DOCX, TXT, RTF, ODT, Images (JPEG, PNG, GIF, WebP), Excel, CSV, JSON (Max 10MB per file)
                    </p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
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

              {/* Recent Uploads */}
              {uploadedFiles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Uploads</CardTitle>
                    <CardDescription>
                      {uploadedFiles.length} file(s) uploaded
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {uploadedFiles.slice(-5).map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-white"
                        >
                          <div className="flex items-center space-x-3">
                            {getUploadedFileIcon(file)}
                            <div>
                              <p className="font-medium text-gray-900">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                              {file.fileName && (
                                <p className="text-xs text-gray-400">
                                  Stored as: {file.fileName}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(file.status)}>
                              {file.status}
                            </Badge>
                            {file.status === 'uploaded' && (
                              <div className="text-green-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Upload Status */}
                    {uploadedFiles.some(f => f.status === 'uploading') && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <p className="text-blue-800">Uploading files...</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FolderOpen className="w-5 h-5 mr-2" />
                      All Files
                    </CardTitle>
                    <CardDescription>
                      {getAllFiles().length} file(s) in your library
                    </CardDescription>
                  </div>
                  <Button
                    onClick={fetchServerFiles}
                    disabled={isLoadingFiles}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingFiles ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading files...</p>
                  </div>
                ) : getAllFiles().length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                    <p className="text-gray-500 mb-4">Upload your first file to get started</p>
                    <Button
                      onClick={() => setActiveTab('upload')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Upload Files
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedFiles).map(([category, files]) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          {category === 'Images' && <Image className="w-5 h-5 mr-2" />}
                          {category === 'Videos' && <Video className="w-5 h-5 mr-2" />}
                          {category === 'Documents' && <FileText className="w-5 h-5 mr-2" />}
                          {category === 'Spreadsheets' && <File className="w-5 h-5 mr-2" />}
                          {category === 'Other' && <File className="w-5 h-5 mr-2" />}
                          {category} ({files.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {files.map((file) => (
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
                                <p className="font-medium text-gray-900 text-sm mb-1 truncate" title={'name' in file ? file.name : file.originalName}>
                                  {'name' in file ? file.name : file.originalName}
                                </p>
                                <p className="text-xs text-gray-500 mb-2">
                                  {formatFileSize(file.size)}
                                </p>
                                {('fileName' in file && (file as UploadedFile).fileName) && (
                                  <p className="text-xs text-gray-400 truncate" title={(file as UploadedFile).fileName!}>
                                    Stored as: {(file as UploadedFile).fileName!}
                                  </p>
                                )}
                                {'uploadedAt' in file && (
                                  <p className="text-xs text-gray-400">
                                    Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                                  </p>
                                )}
                                {'error' in file && file.error && (
                                  <p className="text-xs text-red-500 mt-1">
                                    Error: {file.error}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Search Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Vector Database Stats
                  </CardTitle>
                  <CardDescription>
                    Overview of your vector database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {searchStats ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg bg-white">
                        <p className="text-sm text-gray-500">Total Vectors</p>
                        <p className="text-2xl font-bold text-gray-900">{searchStats.totalVectorCount || 0}</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-white">
                        <p className="text-sm text-gray-500">Dimensions</p>
                        <p className="text-2xl font-bold text-gray-900">{searchStats.dimension || 0}</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-white">
                        <p className="text-sm text-gray-500">Index Fullness</p>
                        <p className="text-2xl font-bold text-gray-900">{((searchStats.indexFullness || 0) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading database stats...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Search Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    Similarity Search
                  </CardTitle>
                  <CardDescription>
                    Search through your embedded documents using semantic similarity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="searchQuery" className="text-sm font-medium text-gray-700">
                        Search Query
                      </label>
                      <textarea
                        id="searchQuery"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter your search query here..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label htmlFor="topK" className="text-sm font-medium text-gray-700">
                          Results:
                        </label>
                        <select
                          id="topK"
                          value={topK}
                          onChange={(e) => setTopK(Number(e.target.value))}
                          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={3}>3</option>
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                      
                      <Button
                        onClick={performSimilaritySearch}
                        disabled={isSearching || !searchQuery.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {isSearching ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            Search
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Search Results</CardTitle>
                    <CardDescription>
                      {searchResults.length} result(s) found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-blue-100 text-blue-800">
                                Rank #{result.rank}
                              </Badge>
                              <Badge className="bg-green-100 text-green-800">
                                Score: {(result.score * 100).toFixed(1)}%
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {result.id}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {result.metadata?.text && typeof result.metadata.text === 'string' && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Content:</p>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                  {result.metadata.text.length > 300 
                                    ? `${result.metadata.text.substring(0, 300)}...`
                                    : result.metadata.text
                                  }
                                </p>
                              </div>
                            )}
                            
                            {result.metadata?.source && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Source:</p>
                                <p className="text-sm text-gray-600">{result.metadata.source}</p>
                              </div>
                            )}
                            
                            {result.metadata?.type && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">File Type:</p>
                                <p className="text-sm text-gray-600">{result.metadata.type}</p>
                              </div>
                            )}
                            
                            {result.metadata?.originalName && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Original Name:</p>
                                <p className="text-sm text-gray-600">{result.metadata.originalName}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
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