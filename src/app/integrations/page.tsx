'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Cloud, Database, FileText, Trash2, Upload, Brain, ArrowRight, RefreshCw, FolderOpen, Play, CheckCircle, AlertCircle, Settings, HardDrive, Files } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Import individual integration components
import OneDriveInterface from '@/components/OneDriveInterface'
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

  const fetchSyncedFiles = async () => {
    setIsLoadingFiles(true)
    try {
      const response = await fetch('/api/files')
      if (!response.ok) {
        throw new Error('Failed to fetch files')
      }
      const data = await response.json()
      if (data.success) {
        setSyncedFiles(data.files || [])
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
    if (selectedFiles.length === syncedFiles.length) {
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
    if (syncedFiles.length === 0) {
      toast({
        title: "No Files",
        description: "Please sync some files first before starting analysis.",
        variant: "destructive"
      })
      return
    }
    
    router.push('/wizard')
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
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Sidebar Navigation */}
        <div className="w-full lg:w-64 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 p-4 lg:p-6 space-y-2">
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2">Integrations</h1>
            <p className="text-xs lg:text-sm text-gray-600 hidden lg:block">Manage integrations and synced files</p>
          </div>
          
          <nav className="flex flex-col lg:flex-col space-y-1">
            <button
              onClick={() => setActiveView('integrations')}
              className={`w-full flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'integrations'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4 mr-3" />
              <span>Integrations</span>
            </button>
            
            <button
              onClick={() => setActiveView('browse-files')}
              className={`w-full flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'browse-files'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Files className="w-4 h-4 mr-3" />
              <span>Browse Files</span>
            </button>
            
            <button
              onClick={() => setActiveView('synced-files')}
              className={`w-full flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'synced-files'
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HardDrive className="w-4 h-4 mr-3" />
              <span>Synced Files</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {syncedFiles.length}
              </Badge>
            </button>
          </nav>

          {/* Quick Action */}
          <div className="pt-4 lg:pt-6 border-t border-gray-200 hidden lg:block">
            <Button
              onClick={handleStartAnalysis}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={syncedFiles.length === 0}
            >
              <Brain className="w-4 h-4 mr-2" />
              Start AI Analysis
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 lg:p-8">
          {/* Integrations View */}
          {activeView === 'integrations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Integrations</h2>
                  <p className="text-gray-600 mt-1 text-sm lg:text-base">Connect and manage your data sources</p>
                </div>
              </div>

              {/* Integration Cards */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {integrations.map((integration) => (
                  <Card 
                    key={integration.id}
                    className={`relative transition-all duration-200 hover:shadow-lg border-2 ${
                      activeIntegration === integration.id 
                        ? 'border-blue-500 shadow-lg bg-blue-50/30' 
                        : 'border-gray-200 hover:border-blue-300'
                    } ${
                      integration.status === 'coming_soon' ? 'opacity-75' : 'cursor-pointer'
                    }`}
                    onClick={() => {
                      if (integration.status !== 'coming_soon') {
                        setActiveIntegration(activeIntegration === integration.id ? null : integration.id)
                      }
                    }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${
                            integration.status === 'connected' 
                              ? 'bg-green-100' 
                              : integration.status === 'coming_soon'
                              ? 'bg-gray-100'
                              : 'bg-blue-100'
                          }`}>
                            {integration.icon}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                              {integration.name}
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 leading-relaxed">
                              {integration.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <Badge 
                          variant="outline"
                          className={`font-medium ${
                            integration.status === 'connected' 
                              ? 'border-green-200 bg-green-50 text-green-700' 
                              : integration.status === 'coming_soon'
                              ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                              : 'border-blue-200 bg-blue-50 text-blue-700'
                          }`}
                        >
                          {integration.status === 'connected' && <CheckCircle className="w-3 h-3 mr-1.5" />}
                          {integration.status === 'coming_soon' && <AlertCircle className="w-3 h-3 mr-1.5" />}
                          {integration.status === 'available' && <Cloud className="w-3 h-3 mr-1.5" />}
                          {integration.status === 'connected' ? 'Connected' : 
                           integration.status === 'coming_soon' ? 'Coming Soon' : 'Available'}
                        </Badge>
                        
                        {integration.status !== 'coming_soon' && (
                          <Button 
                            variant={activeIntegration === integration.id ? "default" : "outline"}
                            size="sm"
                            className={`transition-all ${
                              activeIntegration === integration.id 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'hover:bg-blue-50 hover:border-blue-300'
                            }`}
                          >
                            {activeIntegration === integration.id ? 'Close' : integration.status === 'connected' ? 'Configure' : 'Connect'}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {/* Active Integration Interface */}
              {activeIntegration && (
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardHeader className="border-b border-blue-200 bg-white/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-blue-900">
                        <div className="p-2 rounded-lg bg-blue-100 mr-3">
                          {integrations.find(i => i.id === activeIntegration)?.icon}
                        </div>
                        <div>
                          <span className="text-xl font-semibold">{integrations.find(i => i.id === activeIntegration)?.name}</span>
                          <CardDescription className="text-blue-700 mt-1">
                            {activeIntegration === 'onedrive' && isOneDriveConnected 
                              ? 'OneDrive is connected and ready to use'
                              : activeIntegration === 'onedrive' && !isOneDriveConnected
                              ? 'Connect to OneDrive to access your files'
                              : 'Upload and manage files for AI analysis'
                            }
                          </CardDescription>
                        </div>
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setActiveIntegration(null)}
                        className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                      >
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {activeIntegration === 'upload' && (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
                          <Upload className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                          <h3 className="text-lg font-semibold text-blue-900 mb-2">
                            Upload Files Directly
                          </h3>
                          <p className="text-blue-700 mb-4">
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
                            <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer" asChild>
                              <span>
                                <Upload className="w-4 h-4 mr-2" />
                                Choose Files
                              </span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    )}
                    
                    {activeIntegration === 'onedrive' && !isOneDriveConnected && (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
                          <Cloud className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                          <h3 className="text-lg font-semibold text-blue-900 mb-2">
                            Connect to OneDrive
                          </h3>
                          <p className="text-blue-700 mb-4">
                            Sign in with your Microsoft account to connect OneDrive
                          </p>
                          <OneDriveInterface
                            onFileSync={handleFileSync}
                            showUpload={false}
                            showDownload={false}
                            showSync={false}
                            className="border-0 shadow-none bg-transparent"
                          />
                        </div>
                      </div>
                    )}
                    
                    {activeIntegration === 'onedrive' && isOneDriveConnected && (
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                          <h3 className="text-lg font-semibold text-green-900 mb-2">
                            OneDrive Connected Successfully
                          </h3>
                          <p className="text-green-700 mb-4">
                            Your OneDrive account is connected and ready to use
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                              onClick={() => setActiveView('browse-files')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Files className="w-4 h-4 mr-2" />
                              Browse Files
                            </Button>
                            <Button
                              onClick={() => setActiveView('synced-files')}
                              variant="outline"
                              className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              <HardDrive className="w-4 h-4 mr-2" />
                              View Synced Files
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Browse Files View */}
          {activeView === 'browse-files' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Browse Files</h2>
                  <p className="text-gray-600 mt-1 text-sm lg:text-base">Browse and sync files from your connected integrations</p>
                </div>
              </div>

              {/* OneDrive File Browser */}
              {isOneDriveConnected ? (
                <Card className="border-blue-200">
                  <CardHeader className="border-b border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="flex items-center text-blue-900">
                      <div className="p-2 rounded-lg bg-blue-100 mr-3">
                        <Cloud className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xl font-semibold">OneDrive Files</span>
                        <CardDescription className="text-blue-700 mt-1">
                          Browse your OneDrive files and sync them for AI analysis
                        </CardDescription>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
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
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="text-center py-16">
                    <Cloud className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Integrations Connected</h3>
                    <p className="text-gray-600 mb-6">
                      Connect to OneDrive or other services to browse your files
                    </p>
                    <Button
                      onClick={() => setActiveView("integrations")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Go to Integrations
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Future integrations can be added here */}
              {/* Google Drive, Dropbox, etc. */}
            </div>
          )}

          {/* Synced Files View */}
          {activeView === 'synced-files' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Synced Files</h2>
                  <p className="text-gray-600 mt-1 text-sm lg:text-base">Manage your synchronized documents</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{syncedFiles.length}</div>
                    <div className="text-sm text-gray-500">Total Files</div>
                  </div>
                  {recentSyncCount > 0 && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">+{recentSyncCount}</div>
                      <div className="text-sm text-gray-500">Recently Added</div>
                    </div>
                  )}
                </div>
              </div>

              {syncedFiles.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="text-center py-16">
                    <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Files Synced Yet</h3>
                    <p className="text-gray-600 mb-6">
                      Go to the Integrations tab to sync your first files
                    </p>
                    <Button
                      onClick={() => setActiveView("integrations")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Go to Integrations
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* File Management Controls */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Database className="w-5 h-5 mr-2" />
                          Document Library ({syncedFiles.length})
                        </CardTitle>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={handleSelectAll}
                            variant="outline"
                            size="sm"
                          >
                            {selectedFiles.length === syncedFiles.length ? 'Deselect All' : 'Select All'}
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
                          
                          <Button
                            onClick={fetchSyncedFiles}
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
                      <div className="space-y-2">
                        {syncedFiles.map((file) => {
                          const isSelected = selectedFiles.includes(file.id)
                          return (
                            <div
                              key={file.id}
                              className={`p-4 border rounded-lg hover:shadow-sm transition-all cursor-pointer ${
                                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                              onClick={() => handleFileSelect(file.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleFileSelect(file.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                  <FileText className="w-5 h-5 text-gray-500" />
                                  <div>
                                    <p className="font-medium text-gray-900">{file.originalName}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                      <span>{formatFileSize(file.size)}</span>
                                      <span>Synced {formatDate(file.uploadedAt)}</span>
                                      {file.isOneDriveFile && (
                                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                          OneDrive
                                        </Badge>
                                      )}
                                      <Badge 
                                        variant={file.status === 'COMPLETED' ? 'default' : 'secondary'}
                                        className="text-xs"
                                      >
                                        {file.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
          
          {/* Mobile AI Analysis Button */}
          <div className="lg:hidden fixed bottom-4 right-4">
            <Button
              onClick={handleStartAnalysis}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg"
              disabled={syncedFiles.length === 0}
              size="lg"
            >
              <Brain className="w-5 h-5 mr-2" />
              Start AI Analysis
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
