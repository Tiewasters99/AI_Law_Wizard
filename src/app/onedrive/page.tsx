'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Cloud, Database, FileText, Trash2, Upload, Brain, ArrowRight, RefreshCw, FolderOpen, Play, CheckCircle, AlertCircle, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Import individual integration components
import OneDriveInterface from '@/components/OneDriveInterface'

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

export default function StorageHubPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [syncedFiles, setSyncedFiles] = useState<SyncedFile[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [activeTab, setActiveTab] = useState("integrations")
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null)
  const [recentSyncCount, setRecentSyncCount] = useState(0)

  // Define available integrations
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
      status: 'connected', // You can make this dynamic based on auth status
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
    setActiveTab("manage")
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                AI Document Analysis Hub
              </h1>
              <p className="text-xl text-gray-600">
                Sync files from any source and run AI-powered analysis on your documents.
              </p>
            </div>
            
            {/* Quick Stats & Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{syncedFiles.length}</div>
                <div className="text-sm text-gray-500">Files Ready</div>
              </div>
              {recentSyncCount > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+{recentSyncCount}</div>
                  <div className="text-sm text-gray-500">Just Synced</div>
                </div>
              )}
              <Button
                onClick={handleStartAnalysis}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3"
                disabled={syncedFiles.length === 0}
                size="lg"
              >
                <Brain className="w-5 h-5 mr-2" />
                Start AI Analysis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="integrations" className="flex items-center space-x-2 text-lg">
              <Plus className="w-5 h-5" />
              <span>Sync Files</span>
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center space-x-2 text-lg">
              <Database className="w-5 h-5" />
              <span>Manage & Analyze ({syncedFiles.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Sync Files Tab - Integration Hub */}
          <TabsContent value="integrations" className="space-y-6">
            {/* Integration Options */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {integrations.map((integration) => (
                <Card 
                  key={integration.id}
                  className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                    activeIntegration === integration.id 
                      ? `border-${integration.color}-500 shadow-lg` 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    integration.status === 'coming_soon' ? 'opacity-50' : ''
                  }`}
                  onClick={() => {
                    if (integration.status !== 'coming_soon') {
                      setActiveIntegration(activeIntegration === integration.id ? null : integration.id)
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg bg-${integration.color}-100`}>
                        {integration.icon}
                      </div>
                      <Badge 
                        variant={integration.status === 'connected' ? 'default' : 'secondary'}
                        className={`${
                          integration.status === 'connected' 
                            ? `bg-${integration.color}-100 text-${integration.color}-800` 
                            : ''
                        }`}
                      >
                        {integration.status === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {integration.status === 'coming_soon' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {integration.status === 'connected' ? 'Ready' : 
                         integration.status === 'coming_soon' ? 'Coming Soon' : 'Available'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      className="w-full" 
                      variant={activeIntegration === integration.id ? "default" : "outline"}
                      disabled={integration.status === 'coming_soon'}
                    >
                      {activeIntegration === integration.id ? 'Close' : 'Use This'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Active Integration Interface */}
            {activeIntegration && (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900">
                    {integrations.find(i => i.id === activeIntegration)?.icon}
                    <span className="ml-2">{integrations.find(i => i.id === activeIntegration)?.name}</span>
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Sync files to your AI analysis workspace
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                  
                  {activeIntegration === 'onedrive' && (
                    <OneDriveInterface
                      onFileSync={handleFileSync}
                      showUpload={false}
                      showDownload={false}
                      showSync={true}
                      className="border-0 shadow-none bg-transparent"
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Manage & Analyze Tab */}
          <TabsContent value="manage" className="space-y-6">
            {syncedFiles.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="text-center py-12">
                  <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Files Synced Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Sync some files first to start analyzing them with AI.
                  </p>
                  <Button
                    onClick={() => setActiveTab("integrations")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Sync Your First Files
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Quick Analysis Section */}
                <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-900">
                      <Play className="w-6 h-6 mr-2" />
                      Ready for AI Analysis
                    </CardTitle>
                    <CardDescription className="text-green-700">
                      {syncedFiles.filter(f => f.status === 'COMPLETED').length} files processed and ready for analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-green-900">Start analyzing your documents</p>
                        <p className="text-sm text-green-700">
                          Ask questions, extract insights, or generate summaries from your synced files
                        </p>
                      </div>
                      <Button
                        onClick={handleStartAnalysis}
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

                {/* File Management */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Database className="w-5 h-5 mr-2" />
                          Your Document Library ({syncedFiles.length})
                        </CardTitle>
                        <CardDescription>
                          Manage and organize your synced files
                        </CardDescription>
                      </div>
                      
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
                            className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${
                              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
