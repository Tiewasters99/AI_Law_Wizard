'use client'

import React, { useState, useEffect } from 'react'
import { 
  listOneDriveFiles, 
  downloadOneDriveFile, 
  uploadToOneDrive,
  formatFileSize,
  getFileIcon,
  base64ToFile,
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
  showUpload?: boolean
  showDownload?: boolean
  className?: string
}

export default function OneDriveInterface({
  onFileSelect,
  onFolderSelect,
  showUpload = true,
  showDownload = true,
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
                <li>Download files from OneDrive</li>
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
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleFileSelect(file)}
              >
                <div className="flex items-center space-x-3">
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
                  {showDownload && !file.isFolder && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        handleFileSelect(file)
                      }}
                    >
                      Download
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
