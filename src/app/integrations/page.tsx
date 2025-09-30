'use client'

import Layout from '@/app/components/Layout'
import { useState, useEffect } from 'react'
import { useToast } from '@/app/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Pagination } from '@/app/components/ui/pagination'
import { Cloud, Database, FileText, Trash2, Upload, Brain, RefreshCw, FolderOpen, CheckCircle, AlertCircle, Settings, HardDrive, Files, ExternalLink, Plus, Zap, Search, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// Import individual integration components
import OneDriveInterface from '@/app/components/OneDriveInterface'
import { graphClient } from '../lib/microsoft-graph'

interface SyncedFile {
  id: string
  fileName: string
  originalName: string
  size: number
  uploadedAt: string
  modifiedAt: string
  path: string
  status: string
  oneDriveId?: string
  isOneDriveFile?: boolean
}

// Integration types and their configurations
interface Integration {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  status: 'connected' | 'available' | 'coming_soon'
  color: string
  component?: React.ComponentType<any>
}

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
}

const pageTransition = {
  type: "tween" as const,
  ease: "anticipate" as const,
  duration: 0.4
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20
    }
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10
    }
  }
}

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      type: "spring" as const,
      stiffness: 300,
      damping: 20
    }
  })
}

const buttonVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10
    }
  },
  tap: { scale: 0.95 }
}

export default function IntegrationsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [syncedFiles, setSyncedFiles] = useState<SyncedFile[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [activeView, setActiveView] = useState("integrations")
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null)
  const [recentSyncCount, setRecentSyncCount] = useState(0)
  const [isOneDriveConnected, setIsOneDriveConnected] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [pageSize] = useState(10)

  // Check OneDrive authentication status
  useEffect(() => {
    const checkOneDriveAuth = () => {
      const isAuth = graphClient.isAuthenticated()
      setIsOneDriveConnected(isAuth)
    }
    
    checkOneDriveAuth()
    // Check periodically in case status changes
    const interval = setInterval(checkOneDriveAuth, 3000)
    
    // Listen for auth state changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('microsoft_') || e.key === null) {
        // Delay to ensure cookies are updated
        setTimeout(checkOneDriveAuth, 100)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Define available integrations with dynamic status
  const integrations: Integration[] = [
    {
      id: 'upload',
      name: 'Manual Upload',
      icon: <Upload className="w-6 h-6" />,
      description: 'Upload files directly from your computer',
      status: 'connected',
      color: 'green'
    },
    {
      id: 'onedrive',
      name: 'Microsoft OneDrive',
      icon: <Cloud className="w-6 h-6" />,
      description: 'Connect your OneDrive account to sync files',
      status: isOneDriveConnected ? 'connected' : 'available',
      color: 'blue',
      component: OneDriveInterface
    },
    {
      id: 'googledrive',
      name: 'Google Drive',
      icon: <Cloud className="w-6 h-6" />,
      description: 'Connect your Google Drive account',
      status: 'coming_soon',
      color: 'green'
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: <Cloud className="w-6 h-6" />,
      description: 'Connect your Dropbox account',
      status: 'coming_soon',
      color: 'blue'
    }
  ]

  // Fetch synced files when component mounts
  useEffect(() => {
    fetchSyncedFiles()
  }, [])

  const fetchSyncedFiles = async (page: number = currentPage, search: string = searchTerm) => {
    setIsLoadingFiles(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(search && { search })
      })
      
      const response = await fetch(`/api/files?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch files')
      }
      const data = await response.json()
      if (data.success) {
        setSyncedFiles(data.files || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalCount(data.pagination?.totalCount || 0)
        setCurrentPage(data.pagination?.currentPage || 1)
      }
    } catch (error) {
      console.error('Error fetching synced files:', error)
      toast({
        title: "Error",
        description: "Failed to fetch synced files",
        variant: "destructive"
      })
    } finally {
      setIsLoadingFiles(false)
    }
  }

  const handleFileSync = async (files: any[]) => {
    setRecentSyncCount(files.length)
    toast({
      title: "Files Synced",
      description: `${files.length} file(s) have been synced and are ready for analysis.`,
    })
    fetchSyncedFiles()
    // Stay on current view or go to synced files
    if (activeView === 'browse-files') {
      // Maybe show a success message but stay on browse files
      toast({
        title: "Success",
        description: "You can continue browsing or view synced files",
        variant: "default"
      })
    } else {
      setActiveView("synced-files")
    }
  }

  // Refresh authentication status
  const refreshAuthStatus = () => {
    const isAuth = graphClient.isAuthenticated()
    setIsOneDriveConnected(isAuth)
  }

  // Handle manual file upload
  const handleManualUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return

    const uploadedFiles = []

    for (const file of Array.from(selectedFiles)) {
      try {
        const formData = new FormData()
        formData.append('files', file)

        const response = await fetch('/api/embedding', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Failed to upload file')
        }

        const data = await response.json()
        
        if (data.success && data.files && data.files.length > 0) {
          uploadedFiles.push(data.files[0])
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        toast({
          title: "Upload Failed",
          description: `Failed to upload "${file.name}"`,
          variant: "destructive"
        })
      }
    }

    if (uploadedFiles.length > 0) {
      handleFileSync(uploadedFiles)
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
    if (selectedFiles.length === syncedFiles.length && syncedFiles.length > 0) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(syncedFiles.map(f => f.id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return

    try {
      for (const fileId of selectedFiles) {
        const file = syncedFiles.find(f => f.id === fileId)
        if (file) {
          const response = await fetch(`/api/files?fileName=${encodeURIComponent(file.fileName)}`, {
            method: 'DELETE'
          })
          if (!response.ok) {
            throw new Error(`Failed to delete ${file.originalName}`)
          }
        }
      }
      
      toast({
        title: "Files Deleted",
        description: `${selectedFiles.length} file(s) have been deleted.`,
      })
      
      setSelectedFiles([])
      fetchSyncedFiles()
    } catch (error) {
      console.error('Error deleting files:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete files",
        variant: "destructive"
      })
    }
  }

  const handleStartAnalysis = () => {
    if (totalCount === 0) {
      toast({
        title: "No Files",
        description: "Please sync some files first before starting analysis.",
        variant: "destructive"
      })
      return
    }
    
    router.push('/wizard')
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchSyncedFiles(page, searchTerm)
  }

  const handleSearch = (search: string) => {
    setSearchTerm(search)
    setCurrentPage(1)
    fetchSyncedFiles(1, search)
  }

  const handleDownloadFile = async (file: SyncedFile) => {
    try {
      console.log(`Starting download for file: ${file.originalName} (ID: ${file.id})`)
      
      const response = await fetch(`/api/files/download?fileId=${file.id}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Download API error:', errorData)
        throw new Error(errorData.error || `Download failed with status ${response.status}`)
      }

      // Check if response is actually a file (not JSON error)
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Server returned error response')
      }

      // Get the filename from the response headers or use the original name
      const contentDisposition = response.headers.get('content-disposition')
      let filename = file.originalName
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      console.log(`Downloading file: ${filename}`)

      // Create blob and download
      const blob = await response.blob()
      console.log(`Blob created with size: ${blob.size} bytes`)
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty')
      }
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Download Started",
        description: `Downloading ${filename}...`,
        variant: "default"
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : 'Failed to download file',
        variant: "destructive"
      })
    }
  }

  const handleOpenFile = async (file: SyncedFile) => {
    try {
      // For OneDrive files, open in OneDrive
      if (file.isOneDriveFile && file.oneDriveId) {
        const oneDriveUrl = `https://onedrive.live.com/edit.aspx?resid=${file.oneDriveId}`
        window.open(oneDriveUrl, '_blank')
        return
      }

      // For local files, try to download and open
      const response = await fetch(`/api/files/download?fileId=${file.id}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch file`)
      }

      // If it's a redirect, the browser will handle it
      if (response.redirected) {
        window.open(response.url, '_blank')
        return
      }

      // Check if response is JSON (error response)
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'File not available')
      }

      // Otherwise, create a blob and open it
      const blob = await response.blob()
      
      // Check if blob is empty or very small (likely an error)
      if (blob.size === 0) {
        throw new Error('File is empty or not accessible')
      }
      
      const url = window.URL.createObjectURL(blob)
      
      // Try to open the file in a new tab
      const newWindow = window.open(url, '_blank')
      if (!newWindow) {
        // If popup was blocked, fall back to download
        const link = document.createElement('a')
        link.href = url
        link.download = file.originalName
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      
      // Clean up the URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)
      
    } catch (error) {
      console.error('Error opening file:', error)
      toast({
        title: 'Cannot Open File',
        description: error instanceof Error ? error.message : 'File is not accessible. Try downloading it instead.',
        variant: 'destructive'
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        {/* Compact Header with Navigation */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/60 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            {/* Top Row - Title and Start Analysis Button */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <h1 className="text-lg lg:text-xl font-bold text-gray-900">
                  Document Management
                </h1>
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                  <span>•</span>
                  <span>Connect data sources</span>
                </div>
              </div>
              <motion.div
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  onClick={handleStartAnalysis}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs px-3 py-1.5"
                  disabled={totalCount === 0}
                  size="sm"
                >
                <Brain className="w-3 h-3 mr-1.5" />
                <span className="hidden sm:inline">Start Analysis</span>
                <span className="sm:hidden">Start</span>
                </Button>
              </motion.div>
            </div>

            {/* Bottom Row - Stats and Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              {/* Document Count */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Documents Ready:</span>
                  <span className="font-semibold text-blue-600">{totalCount}</span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="flex space-x-1 bg-gray-50 rounded-lg p-1">
                <motion.button
                  onClick={() => setActiveView('integrations')}
                  className={`flex items-center px-3 py-1.5 rounded-md font-medium text-xs transition-all duration-200 ${
                    activeView === 'integrations'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-3 h-3 mr-1.5" />
                  <span className="hidden sm:inline">Data Sources</span>
                  <span className="sm:hidden">Sources</span>
                </motion.button>
                
                <motion.button
                  onClick={() => setActiveView('browse-files')}
                  className={`flex items-center px-3 py-1.5 rounded-md font-medium text-xs transition-all duration-200 ${
                    activeView === 'browse-files'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Files className="w-3 h-3 mr-1.5" />
                  <span className="hidden sm:inline">Browse Files</span>
                  <span className="sm:hidden">Browse</span>
                </motion.button>
                
                <motion.button
                  onClick={() => setActiveView('synced-files')}
                  className={`flex items-center px-3 py-1.5 rounded-md font-medium text-xs transition-all duration-200 ${
                    activeView === 'synced-files'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <HardDrive className="w-3 h-3 mr-1.5" />
                  <span className="hidden sm:inline">Document Library</span>
                  <span className="sm:hidden">Library</span>
                  {totalCount > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs bg-blue-100 text-blue-700">
                      {totalCount}
                    </Badge>
                  )}
                </motion.button>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <AnimatePresence mode="wait">
            {/* Integrations View */}
            {activeView === 'integrations' && !activeIntegration && (
            <motion.div 
              className="space-y-6"
              key="integrations"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              {/* Compact Header */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Data Sources</h2>
                <p className="text-gray-600">Choose how you'd like to add files to your document library</p>
              </motion.div>

              {/* Integration Cards - Single Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                {integrations.map((integration, index) => (
                  <motion.div
                    key={integration.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    custom={index}
                    className="h-full"
                  >
                    <Card 
                      className={`group relative transition-all duration-200 cursor-pointer border-2 ${
                        'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                      } ${
                        integration.status === 'coming_soon' ? 'opacity-60 cursor-not-allowed' : ''
                      } rounded-lg overflow-hidden h-full`}
                      onClick={() => {
                        if (integration.status !== 'coming_soon') {
                          setActiveIntegration(integration.id)
                        }
                      }}
                    >
                      <div className="p-4 h-full flex flex-col">
                        {/* Icon and Status */}
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-2 rounded-lg ${
                            integration.status === 'connected' 
                              ? 'bg-green-100 text-green-600' 
                              : integration.status === 'coming_soon'
                              ? 'bg-gray-100 text-gray-500'
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {integration.icon}
                          </div>
                          
                          <Badge 
                            className={`px-2 py-1 rounded-full text-xs ${
                              integration.status === 'connected' 
                                ? 'bg-green-100 text-green-700' 
                                : integration.status === 'coming_soon'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {integration.status === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {integration.status === 'coming_soon' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {integration.status === 'available' && <Plus className="w-3 h-3 mr-1" />}
                            {integration.status === 'connected' ? 'Connected' : 
                             integration.status === 'coming_soon' ? 'Soon' : 'Available'}
                          </Badge>
                        </div>

                        {/* Content - Flexible area */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                              {integration.name}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {integration.description}
                            </p>
                          </div>

                          {/* Action Button - Always at bottom */}
                          <div className="mt-6">
                            {integration.status === 'coming_soon' ? (
                              <div className="w-full py-2.5 px-3 bg-gray-100 text-gray-500 rounded-lg text-center text-sm font-medium">
                                Coming Soon
                              </div>
                            ) : (
                              <Button 
                                className={`w-full ${
                                  integration.status === 'connected'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                                size="sm"
                              >
                                {integration.status === 'connected' ? 'Manage' : 'Connect'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Active Integration Interface */}
          {activeView === 'integrations' && activeIntegration && (
            <motion.div 
              className="space-y-4"
              key="active-integration"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              {/* Compact Header with Back Button */}
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveIntegration(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    {integrations.find(i => i.id === activeIntegration)?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {integrations.find(i => i.id === activeIntegration)?.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {activeIntegration === 'onedrive' && isOneDriveConnected 
                        ? 'OneDrive is connected and ready to use'
                        : activeIntegration === 'onedrive' && !isOneDriveConnected
                        ? 'Connect to OneDrive to access your files'
                        : 'Upload and manage files for AI analysis'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Integration Content */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                    {activeIntegration === 'upload' && (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50/50">
                          <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Upload className="w-6 h-6 text-blue-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Upload Files
                          </h4>
                          <p className="text-gray-600 mb-4 text-sm">
                            Select files from your computer to upload and sync for AI analysis
                          </p>
                          <input
                            type="file"
                            multiple
                            onChange={(e) => handleManualUpload(e.target.files)}
                            className="hidden"
                            id="file-upload"
                            accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.jpg,.jpeg,.png,.gif,.webp,.xls,.xlsx,.csv,.json"
                          />
                          <label htmlFor="file-upload">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2" asChild>
                              <span>
                                <Upload className="w-4 h-4 mr-2" />
                                Choose Files
                              </span>
                            </Button>
                          </label>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h5 className="font-medium text-gray-900 mb-2 text-sm">Supported File Types:</h5>
                          <div className="flex flex-wrap gap-1 text-xs text-gray-600">
                            <span className="bg-white px-2 py-1 rounded border">PDF</span>
                            <span className="bg-white px-2 py-1 rounded border">DOC</span>
                            <span className="bg-white px-2 py-1 rounded border">DOCX</span>
                            <span className="bg-white px-2 py-1 rounded border">TXT</span>
                            <span className="bg-white px-2 py-1 rounded border">RTF</span>
                            <span className="bg-white px-2 py-1 rounded border">XLS</span>
                            <span className="bg-white px-2 py-1 rounded border">XLSX</span>
                            <span className="bg-white px-2 py-1 rounded border">CSV</span>
                            <span className="bg-white px-2 py-1 rounded border">JSON</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeIntegration === 'onedrive' && !isOneDriveConnected && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <OneDriveInterface
                            onFileSync={handleFileSync}
                            showUpload={false}
                            showDownload={false}
                            showSync={false}
                            className="border-0 shadow-none bg-transparent"
                          />
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h5 className="font-medium text-gray-900 mb-2 text-sm">OneDrive Features:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Browse and sync files from your OneDrive</li>
                            <li>• Access files from any device</li>
                            <li>• Automatic file organization</li>
                            <li>• Secure cloud storage integration</li>
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {activeIntegration === 'onedrive' && isOneDriveConnected && (
                      <div className="space-y-4">
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            OneDrive Connected
                          </h3>
                          <p className="text-sm text-gray-600">
                            Your OneDrive account is connected and ready to use
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={() => setActiveView('browse-files')}
                            className="bg-blue-600 hover:bg-blue-700 text-white h-10 flex items-center justify-center text-sm"
                          >
                            <Files className="w-4 h-4 mr-2" />
                            Browse Files
                          </Button>
                          <Button
                            onClick={() => setActiveView('synced-files')}
                            variant="outline"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50 h-10 flex items-center justify-center text-sm"
                          >
                            <HardDrive className="w-4 h-4 mr-2" />
                            View Synced Files
                          </Button>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h5 className="font-medium text-gray-900 mb-2 text-sm">Available Features:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Browse your OneDrive files and folders</li>
                            <li>• Sync files for AI analysis</li>
                            <li>• Download and open files directly</li>
                            <li>• Automatic file organization</li>
                          </ul>
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Browse Files View */}
          {activeView === 'browse-files' && (
            <motion.div 
              className="space-y-4"
              key="browse-files"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              {/* OneDrive File Browser */}
              {isOneDriveConnected ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-t-lg">
                    <CardTitle className="flex items-center justify-between text-gray-900">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 shadow-sm">
                          <Cloud className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <span className="text-lg font-semibold">OneDrive Files</span>
                          <span className="text-sm text-gray-600 ml-2">Browse and sync files for AI analysis</span>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <OneDriveInterface
                      onFileSync={handleFileSync}
                      showUpload={false}
                      showDownload={false}
                      showSync={true}
                      className="border-0 shadow-none bg-transparent"
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-dashed border-gray-300/60 bg-gradient-to-br from-gray-50/50 to-slate-50/50 backdrop-blur-sm">
                  <CardContent className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-slate-100 rounded-2xl flex items-center justify-center shadow-lg">
                      <Cloud className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Integrations Connected</h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      Connect to OneDrive or other services to browse your files
                    </p>
                    <Button
                      onClick={() => setActiveView("integrations")}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Settings className="w-5 h-5 mr-2" />
                      Go to Data Sources
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Synced Files View */}
          {activeView === 'synced-files' && (
            <motion.div 
              className="space-y-4"
              key="synced-files"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              {isLoadingFiles ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-20"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full"
                    />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Files...</h3>
                    <p className="text-gray-600">Please wait while we fetch your files</p>
                  </div>
                </motion.div>
              ) : totalCount === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-2 border-dashed border-gray-300/60 bg-gradient-to-br from-gray-50/50 to-slate-50/50 backdrop-blur-sm">
                    <CardContent className="text-center py-20">
                      <motion.div 
                        className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-slate-100 rounded-2xl flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <FolderOpen className="w-12 h-12 text-gray-400" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">No Files Synced Yet</h3>
                      <p className="text-gray-600 mb-8 text-lg">
                        Go to the Data Sources tab to sync your first files
                      </p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => setActiveView("integrations")}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                          <Settings className="w-5 h-5 mr-2" />
                          Go to Data Sources
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <>
                  {/* File Management Controls */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-t-lg">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <CardTitle className="flex items-center text-xl lg:text-2xl font-bold">
                          <div className="p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 mr-3 lg:mr-4 shadow-lg">
                            <Database className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                          </div>
                          <div>
                            <span>Document Library</span>
                            <div className="text-sm font-normal text-gray-600 mt-1">
                              {totalCount} files • Page {currentPage} of {totalPages}
                            </div>
                          </div>
                        </CardTitle>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                          {/* Search */}
                          <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Search files..."
                              value={searchTerm}
                              onChange={(e) => handleSearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                onClick={handleSelectAll}
                                variant="outline"
                                size="sm"
                                className="bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all duration-200"
                              >
                                {selectedFiles.length === syncedFiles.length && syncedFiles.length > 0 ? 'Deselect All' : 'Select All'}
                              </Button>
                            </motion.div>
                            
                            {selectedFiles.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              >
                                <Button
                                  onClick={handleDeleteSelected}
                                  variant="destructive"
                                  size="sm"
                                  className="shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete ({selectedFiles.length})
                                </Button>
                              </motion.div>
                            )}
                            
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                onClick={() => fetchSyncedFiles()}
                                disabled={isLoadingFiles}
                                variant="outline"
                                size="sm"
                                className="bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all duration-200"
                              >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                                Refresh
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                
                    <CardContent className="p-3 lg:p-4">
                      <div className="space-y-1">
                        {syncedFiles.map((file, index) => {
                          const isSelected = selectedFiles.includes(file.id)
                          return (
                            <motion.div
                              key={file.id}
                              variants={listItemVariants}
                              initial="hidden"
                              animate="visible"
                              custom={index}
                              className={`group p-3 lg:p-4 border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer backdrop-blur-sm ${
                                isSelected 
                                  ? 'border-blue-500 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 shadow-md' 
                                  : 'border-gray-200/60 bg-white/60 hover:border-blue-300/60 hover:bg-white/80'
                              }`}
                              onClick={() => handleFileSelect(file.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleFileSelect(file.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-1 flex-shrink-0"
                                  />
                                  <div className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-slate-100 shadow-sm flex-shrink-0">
                                    <FileText className="w-4 h-4 text-gray-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-900 text-sm mb-1" title={file.originalName}>
                                      {file.originalName}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                      <span className="flex items-center space-x-1">
                                        <span className="font-medium">Size:</span>
                                        <span>{formatFileSize(file.size)}</span>
                                      </span>
                                      <span className="flex items-center space-x-1">
                                        <span className="font-medium">Uploaded:</span>
                                        <span>{formatDate(file.uploadedAt)}</span>
                                      </span>
                                      {file.isOneDriveFile && (
                                        <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 shadow-sm px-2 py-1">
                                          OneDrive
                                        </Badge>
                                      )}
                                      <Badge 
                                        variant={file.status === 'COMPLETED' ? 'default' : 'secondary'}
                                        className={`text-xs shadow-sm px-2 py-1 ${
                                          file.status === 'COMPLETED' 
                                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' 
                                            : 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200'
                                        }`}
                                      >
                                        {file.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Action buttons */}
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDownloadFile(file)
                                      }}
                                      variant="outline"
                                      size="sm"
                                      className="bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 shadow-sm hover:shadow-md h-8 px-3 transition-all duration-200"
                                      title="Download file"
                                    >
                                      <Download className="w-4 h-4 mr-1" />
                                      <span className="text-xs font-medium">Download</span>
                                    </Button>
                                  </motion.div>
                                  
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleOpenFile(file)
                                      }}
                                      variant="outline"
                                      size="sm"
                                      className="bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300 text-green-700 hover:text-green-800 shadow-sm hover:shadow-md h-8 px-3 transition-all duration-200"
                                      title="Open file"
                                    >
                                      <ExternalLink className="w-4 h-4 mr-1" />
                                      <span className="text-xs font-medium">Open</span>
                                    </Button>
                                  </motion.div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                      
                      {/* Enhanced Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-6 pt-6 border-t border-gradient-to-r from-gray-200/60 via-blue-200/40 to-gray-200/60">
                          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                            {/* Pagination Info */}
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="font-medium">
                                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} files
                                </span>
                              </div>
                            </div>
                            
                            {/* Pagination Controls */}
                            <div className="flex items-center space-x-2">
                              <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                className="justify-center"
                              />
                            </div>
                            
                            {/* Quick Jump */}
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600 font-medium">Go to:</span>
                              <select
                                value={currentPage}
                                onChange={(e) => handlePageChange(parseInt(e.target.value))}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 hover:bg-white transition-all duration-200"
                              >
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                  <option key={page} value={page}>
                                    Page {page}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      </div>
    </Layout>
  )
}
