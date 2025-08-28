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
      router.replace('/onedrive')
    }

    if (success) {
      toast({
        title: "Authentication Successful",
        description: "You are now connected to OneDrive!",
      })
      // Clear the success from URL
      router.replace('/onedrive')
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
        toast({
          title: "Error",
          description: result.error || "Failed to load files",
          variant: "destructive"
        })
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
        throw new Error(`Embedding API error: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
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

    const syncedFilesList = []

    for (const file of filesToSync) {
      setSyncingFiles(prev => new Set(prev).add(file.id))
    }

    try {
      for (const file of filesToSync) {
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
            throw new Error(`Embedding API error: ${response.status} - ${errorData}`)
          }

          const data = await response.json()
          
          if (data.error) {
            throw new Error(data.error)
          }

          // Mark file as synced
          setSyncedFiles(prev => new Set(prev).add(file.id))
          syncedFilesList.push({ name: file.name, id: file.id })

        } catch (error) {
          console.error(`Error syncing file ${file.name}:`, error)
          toast({
            title: "Sync Failed",
            description: `Failed to sync "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
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

      if (syncedFilesList.length > 0) {
        toast({
          title: "Bulk Sync Complete",
          description: `Successfully synced ${syncedFilesList.length} file(s) to the embedding system`
        })

        // Clear selection after successful sync
        setSelectedForSync(new Set())

        // Call the onFileSync callback if provided
        if (onFileSync) {
          onFileSync(syncedFilesList)
        }
      }

    } catch (error) {
      console.error('Error in bulk sync:', error)
      toast({
        title: "Bulk Sync Failed",
        description: error instanceof Error ? error.message : "Failed to complete bulk sync",
        variant: "destructive"
      })
    }
  }

  // Toggle file selection for sync
  const toggleFileSelection = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedForSync(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  // Select all unsync files
  const selectAllForSync = () => {
    const unsyncedFiles = files.filter(file => !file.isFolder && !syncedFiles.has(file.id))
    setSelectedForSync(new Set(unsyncedFiles.map(f => f.id)))
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>OneDrive Files</span>
            <Badge variant="secondary">{files.length} items</Badge>
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

        {/* Bulk Sync Controls */}
        {showSync && files.some(f => !f.isFolder && !syncedFiles.has(f.id)) && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-blue-900">Bulk Sync to AI Analysis</h4>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllForSync}
                  disabled={files.filter(f => !f.isFolder && !syncedFiles.has(f.id)).length === selectedForSync.size}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  disabled={selectedForSync.size === 0}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleBulkSync}
                  disabled={selectedForSync.size === 0 || Array.from(selectedForSync).some(id => syncingFiles.has(id))}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  Sync Selected ({selectedForSync.size})
                </Button>
              </div>
            </div>
            <p className="text-sm text-blue-700">
              Select files to sync them to the AI analysis system. Synced files can be analyzed with the AI wizard.
            </p>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600">
          {folderPath.join(' / ')}
        </div>

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
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
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
                  {!showSync && showDownload && !file.isFolder && !syncedFiles.has(file.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e: React.MouseEvent) => handleFileSync(file, e)}
                      disabled={syncingFiles.has(file.id)}
                    >
                      {syncingFiles.has(file.id) ? 'Syncing...' : 'Sync'}
                    </Button>
                  )}
                  {showSync && !file.isFolder && !syncedFiles.has(file.id) && !selectedForSync.has(file.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e: React.MouseEvent) => handleFileSync(file, e)}
                      disabled={syncingFiles.has(file.id)}
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
          <CardTitle>OneDrive Integration</CardTitle>
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
