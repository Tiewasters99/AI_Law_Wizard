'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { 
  listOneDriveFiles, 
  downloadOneDriveFile, 
  uploadToOneDrive,
  formatFileSize,
  getFileIcon,
  base64ToFile,
  checkSyncedOneDriveFiles,
  type OneDriveFileInfo 
} from '../lib/onedrive'
import { Download, ExternalLink } from 'lucide-react'
import { graphClient } from '../lib/microsoft-graph'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { useToast } from './ui/use-toast'
import { useSearchParams, useRouter } from 'next/navigation'

interface OneDriveInterfaceProps {
  onFileSelect?: (file: File) => void
  onFolderSelect?: (folderId: string, folderName: string) => void
  onFileSync?: (files: any[]) => void
  showUpload?: boolean
  showDownload?: boolean
  showSync?: boolean
  className?: string
}

function OneDriveInterfaceContent({
  onFileSelect,
  onFolderSelect,
  onFileSync,
  showUpload = true,
  showDownload = true,
  showSync = false,
  className = ''
}: OneDriveInterfaceProps) {
  const [files, setFiles] = useState<OneDriveFileInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [currentFolder, setCurrentFolder] = useState('root')
  const [folderPath, setFolderPath] = useState<string[]>(['Home'])
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [syncingFiles, setSyncingFiles] = useState<Set<string>>(new Set())
  const [syncedFiles, setSyncedFiles] = useState<Set<string>>(new Set())
  const [selectedForSync, setSelectedForSync] = useState<Set<string>>(new Set())
  const [batchProcessing, setBatchProcessing] = useState(false)
  const [batchProgress, setBatchProgress] = useState({ processed: 0, total: 0, current: '' })
  const [batchErrors, setBatchErrors] = useState<Array<{fileName: string, error: string}>>([])
  
  // File selection limit
  const MAX_SELECTION_LIMIT = 40
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Check authentication status on mount and when URL params change
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = graphClient.isAuthenticated()
      setIsAuthenticated(authenticated)
      if (authenticated) {
        loadFiles()
      }
    }

    // Check for OAuth callback results first
    const error = searchParams.get('error')
    const success = searchParams.get('success')

    if (error) {
      toast({
        title: "Authentication Error",
        description: decodeURIComponent(error),
        variant: "destructive"
      })
      // Clear the error from URL
      router.replace('/integrations')
    }

    if (success) {
      toast({
        title: "Authentication Successful",
        description: "You are now connected to OneDrive!",
      })
      // Clear the success from URL
      router.replace('/integrations')
      // Re-check auth status after a short delay to ensure tokens are loaded
      setTimeout(checkAuth, 100)
    } else {
      checkAuth()
    }
  }, [searchParams, toast, router])

  // Load files from current folder
  const loadFiles = async (folderId: string = currentFolder) => {
    if (!isAuthenticated) return

    setLoading(true)
    try {
      const result = await listOneDriveFiles({
        folderId,
        pageSize: 100,
        search: searchTerm || undefined,
        orderBy: 'name'
      })

      if (result.success && result.files) {
        setFiles(result.files)
        // Check which files are already synced
        await checkSyncStatus(result.files)
      } else {
        // Check if it's an authentication error
        if (result.error?.includes('Authentication required')) {
          setIsAuthenticated(false)
          toast({
            title: "Authentication Required",
            description: "Please sign in to OneDrive to access your files",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load files",
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('authenticate')) {
        setIsAuthenticated(false)
        toast({
          title: "Authentication Required",
          description: "Please sign in to access OneDrive",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to load files from OneDrive",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // Check sync status for files
  const checkSyncStatus = async (fileList: OneDriveFileInfo[]) => {
    try {
      const fileIds = fileList
        .filter(file => !file.isFolder)
        .map(file => file.id)
      
      if (fileIds.length === 0) return

      const result = await checkSyncedOneDriveFiles(fileIds)
      
      if (result.success && result.syncedFiles) {
        const syncedIds = new Set(result.syncedFiles.map(file => file.oneDriveId))
        setSyncedFiles(syncedIds)
      }
    } catch (error) {
      console.error('Error checking sync status:', error)
    }
  }

  // Load files when authenticated and dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      loadFiles()
    }
  }, [currentFolder, searchTerm, isAuthenticated])

  // Handle authentication
  const handleSignIn = async () => {
    setAuthLoading(true)
    try {
      const authUrl = graphClient.generateAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to start authentication",
        variant: "destructive"
      })
      setAuthLoading(false)
    }
  }

  const handleSignOut = () => {
    graphClient.logout()
    setIsAuthenticated(false)
    setFiles([])
    toast({
      title: "Signed Out",
      description: "You have been signed out of OneDrive",
    })
  }

  // Navigate to folder
  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolder(folderId)
    setFolderPath([...folderPath, folderName])
    if (onFolderSelect) {
      onFolderSelect(folderId, folderName)
    }
  }

  // Navigate back
  const navigateBack = () => {
    if (folderPath.length > 1) {
      setFolderPath(folderPath.slice(0, -1))
      // For simplicity, we'll reload the root folder
      // In a real implementation, you'd want to track the parent folder ID
      setCurrentFolder('root')
    }
  }

  // Handle file selection
  const handleFileSelect = async (file: OneDriveFileInfo) => {
    if (file.isFolder) {
      navigateToFolder(file.id, file.name)
      return
    }

    if (onFileSelect) {
      try {
        setLoading(true)
        const result = await downloadOneDriveFile(file.id)
        
        if (result.success && result.file) {
          const downloadedFile = base64ToFile(
            result.file.content,
            result.file.name,
            result.file.type
          )
          onFileSelect(downloadedFile)
          toast({
            title: "Success",
            description: `File "${file.name}" selected successfully`
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to download file",
            variant: "destructive"
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to download file",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle direct download from OneDrive
  const handleDownloadFile = async (file: OneDriveFileInfo, e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      setLoading(true)
      const result = await downloadOneDriveFile(file.id)
      
      if (result.success && result.file) {
        // Create blob and download
        const blob = new Blob([Buffer.from(result.file.content, 'base64')], { 
          type: result.file.type || 'application/octet-stream' 
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.file.name
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Download Started",
          description: `Downloading ${file.name}...`,
          variant: "default"
        })
      } else {
        toast({
          title: "Download Failed",
          description: result.error || "Failed to download file",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download file",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle open file in OneDrive
  const handleOpenFile = async (file: OneDriveFileInfo, e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      // Get the web URL from OneDrive using Microsoft Graph API
      const fileMetadata = await graphClient.getFileMetadata(file.id) as any
      const webUrl = fileMetadata.webUrl || fileMetadata['@microsoft.graph.downloadUrl']
      
      if (webUrl) {
        window.open(webUrl, '_blank')
        toast({
          title: "Opening File",
          description: `Opening ${file.name} in OneDrive...`,
          variant: "default"
        })
      } else {
        // Fallback to direct OneDrive URL
        const oneDriveUrl = `https://onedrive.live.com/?id=${encodeURIComponent(file.id)}`
        window.open(oneDriveUrl, '_blank')
        toast({
          title: "Opening File",
          description: `Opening ${file.name} in OneDrive...`,
          variant: "default"
        })
      }
    } catch (error) {
      console.error('Error opening file:', error)
      toast({
        title: "Open Failed",
        description: "Failed to open file. Please try downloading instead.",
        variant: "destructive"
      })
    }
  }

  // Handle file sync to embedding system
  const handleFileSync = async (file: OneDriveFileInfo, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (file.isFolder) {
      toast({
        title: "Error",
        description: "Cannot sync folders to embedding system",
        variant: "destructive"
      })
      return
    }

    // Check if file is already synced
    if (syncedFiles.has(file.id)) {
      toast({
        title: "Already Synced",
        description: `File "${file.name}" is already synced to the embedding system`,
        variant: "destructive"
      })
      return
    }

    // Check if file is already being synced
    if (syncingFiles.has(file.id)) {
      return
    }

    setSyncingFiles(prev => new Set(prev).add(file.id))

    try {
      // Download the file from OneDrive
      const result = await downloadOneDriveFile(file.id)
      
      if (!result.success || !result.file) {
        throw new Error(result.error || "Failed to download file from OneDrive")
      }

      // Convert base64 to File object
      const downloadedFile = base64ToFile(
        result.file.content,
        result.file.name,
        result.file.type
      )

      // Create FormData for the embedding API
      const formData = new FormData()
      formData.append('files', downloadedFile)
      formData.append('oneDriveId', file.id)
      formData.append('oneDriveLastModified', file.lastModified)

      // Upload to embedding system
      const response = await fetch('/api/embedding', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.text()
        let errorMessage = `Server error (${response.status})`
        
        try {
          const errorJson = JSON.parse(errorData)
          errorMessage = errorJson.error || errorJson.message || errorMessage
        } catch {
          errorMessage = errorData || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Check for failed files in the response
      if (data.failedFiles && data.failedFiles.length > 0) {
        const failedFile = data.failedFiles[0]
        throw new Error(`File processing failed: ${failedFile.error}`)
      }

      // Mark file as synced
      setSyncedFiles(prev => new Set(prev).add(file.id))

      toast({
        title: "Sync Successful",
        description: `File "${file.name}" has been synced to the embedding system`
      })

    } catch (error) {
      console.error('Error syncing file:', error)
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync file to embedding system",
        variant: "destructive"
      })
    } finally {
      setSyncingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(file.id)
        return newSet
      })
    }
  }

  // Handle bulk sync
  const handleBulkSync = async () => {
    const filesToSync = files.filter(file => 
      !file.isFolder && 
      selectedForSync.has(file.id) && 
      !syncedFiles.has(file.id) &&
      !syncingFiles.has(file.id)
    )

    if (filesToSync.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to sync that haven't been synced already.",
        variant: "destructive"
      })
      return
    }

    if (filesToSync.length > 40) {
      toast({
        title: "Too Many Files",
        description: "Please select 40 or fewer files for batch processing.",
        variant: "destructive"
      })
      return
    }

    setBatchProcessing(true)
    setBatchProgress({ processed: 0, total: filesToSync.length, current: '' })
    setBatchErrors([])

    const syncedFilesList = []
    let successCount = 0
    let errorCount = 0
    const errors: Array<{fileName: string, error: string}> = []

    for (const file of filesToSync) {
      setSyncingFiles(prev => new Set(prev).add(file.id))
    }

    try {
      for (let i = 0; i < filesToSync.length; i++) {
        const file = filesToSync[i]
        
        setBatchProgress(prev => ({ 
          ...prev, 
          current: file.name,
          processed: i 
        }))

        // Add small delay to prevent API rate limiting
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        let retryCount = 0
        const maxRetries = 3
        let fileSuccess = false

        while (retryCount < maxRetries && !fileSuccess) {
          try {
            // Download the file from OneDrive
            const result = await downloadOneDriveFile(file.id)
            
            if (!result.success || !result.file) {
              throw new Error(result.error || "Failed to download file from OneDrive")
            }

            // Convert base64 to File object
            const downloadedFile = base64ToFile(
              result.file.content,
              result.file.name,
              result.file.type
            )

            // Create FormData for the embedding API
            const formData = new FormData()
            formData.append('files', downloadedFile)
            formData.append('oneDriveId', file.id)
            formData.append('oneDriveLastModified', file.lastModified)

            // Upload to embedding system with timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

            const response = await fetch('/api/embedding', {
              method: 'POST',
              body: formData,
              signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
              const errorData = await response.text()
              let errorMessage = `Server error (${response.status})`
              
              try {
                const errorJson = JSON.parse(errorData)
                errorMessage = errorJson.error || errorJson.message || errorMessage
              } catch {
                errorMessage = errorData || errorMessage
              }
              
              throw new Error(errorMessage)
            }

            const data = await response.json()
            
            if (data.error) {
              throw new Error(data.error)
            }

            // Check for failed files in the response
            if (data.failedFiles && data.failedFiles.length > 0) {
              const failedFile = data.failedFiles[0]
              throw new Error(`File processing failed: ${failedFile.error}`)
            }

            // Mark file as synced
            setSyncedFiles(prev => new Set(prev).add(file.id))
            syncedFilesList.push({ name: file.name, id: file.id })
            successCount++
            fileSuccess = true

          } catch (error) {
            retryCount++
            console.error(`Error syncing file ${file.name} (attempt ${retryCount}):`, error)
            
            if (retryCount >= maxRetries) {
              errorCount++
              errors.push({
                fileName: file.name,
                error: error instanceof Error ? error.message : 'Unknown error'
              })
            } else {
              // Wait before retry (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
            }
          }
        }
        
        setSyncingFiles(prev => {
          const newSet = new Set(prev)
          newSet.delete(file.id)
          return newSet
        })
      }

      // Update batch errors state
      setBatchErrors(errors)

      // Show final results
      if (errorCount > 0) {
        toast({
          title: "Bulk Sync Complete with Errors",
          description: `Successfully synced ${successCount} files, ${errorCount} failed. Check details below.`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Bulk Sync Complete",
          description: `Successfully synced ${successCount} files`
        })
      }

      // Clear selection after sync
      setSelectedForSync(new Set())

      // Call the onFileSync callback if provided
      if (onFileSync && syncedFilesList.length > 0) {
        onFileSync(syncedFilesList)
      }

    } catch (error) {
      console.error('Error in bulk sync:', error)
      toast({
        title: "Bulk Sync Failed",
        description: error instanceof Error ? error.message : "Failed to complete bulk sync",
        variant: "destructive"
      })
    } finally {
      setBatchProcessing(false)
      setBatchProgress({ processed: 0, total: 0, current: '' })
    }
  }

  // Toggle file selection for sync
  const toggleFileSelection = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Find the file to check its size
    const file = files.find(f => f.id === fileId)
    if (file && file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: `"${file.name}" is ${formatFileSize(file.size)}. Maximum size is 50MB.`,
        variant: "destructive"
      })
      return
    }
    
    setSelectedForSync(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        // Removing a file - always allowed
        newSet.delete(fileId)
      } else {
        // Adding a file - check limit
        if (newSet.size >= MAX_SELECTION_LIMIT) {
          toast({
            title: "Selection Limit Reached",
            description: `You can only select up to ${MAX_SELECTION_LIMIT} files at once. Please deselect some files first.`,
            variant: "destructive"
          })
          return prev
        }
        newSet.add(fileId)
      }
      return newSet
    })
  }

  // Select all unsync files
  const selectAllForSync = () => {
    const unsyncedFiles = files.filter(file => 
      !file.isFolder && 
      !syncedFiles.has(file.id) && 
      file.size <= 50 * 1024 * 1024 // Exclude files larger than 50MB
    )
    
    // Limit to MAX_SELECTION_LIMIT files
    const filesToSelect = unsyncedFiles.slice(0, MAX_SELECTION_LIMIT)
    setSelectedForSync(new Set(filesToSelect.map(f => f.id)))
    
    // Show warnings for excluded files
    const largeFiles = files.filter(file => 
      !file.isFolder && 
      !syncedFiles.has(file.id) && 
      file.size > 50 * 1024 * 1024
    )
    
    const excludedFiles = unsyncedFiles.length - filesToSelect.length
    
    if (largeFiles.length > 0 || excludedFiles > 0) {
      let message = ''
      if (largeFiles.length > 0 && excludedFiles > 0) {
        message = `${largeFiles.length} file(s) larger than 50MB and ${excludedFiles} file(s) beyond the ${MAX_SELECTION_LIMIT} limit were not selected.`
      } else if (largeFiles.length > 0) {
        message = `${largeFiles.length} file(s) larger than 50MB were not selected.`
      } else if (excludedFiles > 0) {
        message = `${excludedFiles} file(s) beyond the ${MAX_SELECTION_LIMIT} limit were not selected.`
      }
      
      toast({
        title: "Some Files Excluded",
        description: message,
        variant: "destructive"
      })
    }
  }

  // Clear all selections
  const clearSelection = () => {
    setSelectedForSync(new Set())
  }

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    try {
      const result = await uploadToOneDrive(selectedFile, currentFolder)
      
      if (result.success) {
        toast({
          title: "Success",
          description: `File "${selectedFile.name}" uploaded successfully`
        })
        setSelectedFile(null)
        loadFiles() // Reload the file list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to upload file",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>OneDrive Integration</span>
            <Badge variant="secondary">Authentication Required</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connect to OneDrive
              </h3>
              <p className="text-gray-600">
                Sign in with your Microsoft account to access your OneDrive files.
              </p>
            </div>
            <Button 
              onClick={handleSignIn} 
              disabled={authLoading}
              className="w-full max-w-xs"
            >
              {authLoading ? 'Connecting...' : 'Sign in with Microsoft'}
            </Button>
            <div className="mt-4 text-sm text-gray-500">
              <p>This will allow you to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Browse your OneDrive files and folders</li>
                <li>Upload files to OneDrive</li>
                <li>Sync files to the embedding system</li>
                <li>Search through your files</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <span className="text-base font-medium">OneDrive Files</span>
            <Badge variant="secondary" className="text-xs">{files.length} items</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
            {folderPath.length > 1 && (
              <Button variant="outline" size="sm" onClick={navigateBack}>
                ← Back
              </Button>
            )}
            {showUpload && (
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  onChange={handleFileInputChange}
                  className="max-w-xs"
                />
                <Button 
                  onClick={handleFileUpload} 
                  disabled={!selectedFile || uploading}
                  size="sm"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* File Selection Controls - Compact */}
        {showSync && files.some(f => !f.isFolder && !syncedFiles.has(f.id)) && (
          <div className="mb-4 p-3 bg-blue-50/50 border border-blue-200/40 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">Prepare Files for Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllForSync}
                  disabled={files.filter(f => !f.isFolder && !syncedFiles.has(f.id)).length === selectedForSync.size}
                  className="text-xs px-2 py-1 h-7"
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  disabled={selectedForSync.size === 0}
                  className="text-xs px-2 py-1 h-7"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleBulkSync}
                  disabled={selectedForSync.size === 0 || batchProcessing || Array.from(selectedForSync).some(id => syncingFiles.has(id))}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-7"
                  size="sm"
                >
                  {batchProcessing ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Preparing...</span>
                    </div>
                  ) : (
                    `Prepare (${selectedForSync.size})`
                  )}
                </Button>
              </div>
            </div>
            
            {/* File Preparation Progress - Compact */}
            {batchProcessing && (
              <div className="mt-3 p-3 bg-blue-50/50 border border-blue-200/40 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-800">Preparing files...</span>
                  </div>
                  <span className="text-xs text-blue-600">
                    {batchProgress.processed}/{batchProgress.total} ({Math.round((batchProgress.processed / batchProgress.total) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-blue-200/60 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(batchProgress.processed / batchProgress.total) * 100}%` }}
                  ></div>
                </div>
                {batchProgress.current && (
                  <p className="text-xs text-blue-700 truncate">
                    {batchProgress.current}
                  </p>
                )}
              </div>
            )}

            {/* File Preparation Issues - Compact */}
            {!batchProcessing && batchErrors.length > 0 && (
              <div className="mt-3 p-3 bg-red-50/50 border border-red-200/40 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-800">Files Need Attention ({batchErrors.length})</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBatchErrors([])}
                    className="text-xs px-2 py-1 h-6"
                  >
                    Dismiss
                  </Button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {batchErrors.map((error, index) => (
                    <div key={index} className="p-2 bg-white/60 rounded border border-red-200/40">
                      <div className="text-xs font-medium text-red-900 mb-1 truncate">
                        {error.fileName}
                      </div>
                      <div className="text-xs text-red-700 break-words">
                        {error.error}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600">
          {folderPath.join(' / ')}
        </div>

        {/* File Size Summary - Compact */}
        {showSync && files.some(f => !f.isFolder && f.size > 50 * 1024 * 1024) && (
          <div className="mb-4 flex items-center space-x-2 text-xs text-yellow-700 bg-yellow-50/50 rounded-lg px-3 py-2">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
            <span>
              {files.filter(f => !f.isFolder && f.size > 50 * 1024 * 1024).length} file(s) too large (50MB+) - cannot sync
            </span>
          </div>
        )}

        {/* Selection Limit Info - Compact */}
        {showSync && (
          <div className="mb-4 flex items-center justify-between text-xs text-gray-600 bg-gray-50/50 rounded-lg px-3 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Selected: {selectedForSync.size} / {MAX_SELECTION_LIMIT} files</span>
              {selectedForSync.size >= MAX_SELECTION_LIMIT && (
                <span className="text-red-600 font-medium">• Limit reached</span>
              )}
            </div>
            {selectedForSync.size > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(selectedForSync.size / MAX_SELECTION_LIMIT) * 100}%` }}
                  ></div>
                </div>
                <span className="text-gray-500">
                  {Math.round((selectedForSync.size / MAX_SELECTION_LIMIT) * 100)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* File List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : files.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No files found
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                  showSync && selectedForSync.has(file.id) ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleFileSelect(file)}
              >
                <div className="flex items-center space-x-3">
                  {showSync && !file.isFolder && !syncedFiles.has(file.id) && (
                    <input
                      type="checkbox"
                      checked={selectedForSync.has(file.id)}
                      onChange={(e) => toggleFileSelection(file.id, e as any)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={file.size > 50 * 1024 * 1024 || (selectedForSync.size >= MAX_SELECTION_LIMIT && !selectedForSync.has(file.id))}
                      className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
                        file.size > 50 * 1024 * 1024 || (selectedForSync.size >= MAX_SELECTION_LIMIT && !selectedForSync.has(file.id)) 
                          ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title={
                        file.size > 50 * 1024 * 1024 
                          ? 'File too large (max 50MB)' 
                          : selectedForSync.size >= MAX_SELECTION_LIMIT && !selectedForSync.has(file.id)
                          ? `Selection limit reached (${MAX_SELECTION_LIMIT} files)`
                          : ''
                      }
                    />
                  )}
                  <span className="text-xl">{getFileIcon(file.type, file.isFolder)}</span>
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-gray-500">
                      {file.isFolder 
                        ? `${file.childCount} items` 
                        : formatFileSize(file.size)
                      }
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {file.isFolder && (
                    <Badge variant="outline">Folder</Badge>
                  )}
                  {!file.isFolder && syncedFiles.has(file.id) && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✓ Synced
                    </Badge>
                  )}
                  {!file.isFolder && file.size > 50 * 1024 * 1024 && (
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                      ⚠️ Too Large (50MB+)
                    </Badge>
                  )}
                  
                  {/* Action buttons for files */}
                  {!file.isFolder && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e: React.MouseEvent) => handleDownloadFile(file, e)}
                        disabled={loading}
                        className="h-7 px-2"
                        title="Download file"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline text-xs">Download</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e: React.MouseEvent) => handleOpenFile(file, e)}
                        className="h-7 px-2"
                        title="Open in OneDrive"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline text-xs">Open</span>
                      </Button>
                    </div>
                  )}
                  
                  {/* Sync buttons */}
                  {!showSync && showDownload && !file.isFolder && !syncedFiles.has(file.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e: React.MouseEvent) => handleFileSync(file, e)}
                      disabled={syncingFiles.has(file.id) || file.size > 50 * 1024 * 1024}
                      title={file.size > 50 * 1024 * 1024 ? 'File too large (max 50MB)' : ''}
                    >
                      {syncingFiles.has(file.id) ? 'Syncing...' : 'Sync'}
                    </Button>
                  )}
                  {showSync && !file.isFolder && !syncedFiles.has(file.id) && !selectedForSync.has(file.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e: React.MouseEvent) => handleFileSync(file, e)}
                      disabled={syncingFiles.has(file.id) || file.size > 50 * 1024 * 1024}
                      title={file.size > 50 * 1024 * 1024 ? 'File too large (max 50MB)' : ''}
                    >
                      {syncingFiles.has(file.id) ? 'Syncing...' : 'Sync Now'}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Main component with Suspense boundary
export default function OneDriveInterface(props: OneDriveInterfaceProps) {
  return (
    <Suspense fallback={
      <Card className={props.className}>
        <CardHeader>
          <CardTitle className="text-lg">
            <span className="text-base font-medium">OneDrive Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading OneDrive...</p>
          </div>
        </CardContent>
      </Card>
    }>
      <OneDriveInterfaceContent {...props} />
    </Suspense>
  )
}
