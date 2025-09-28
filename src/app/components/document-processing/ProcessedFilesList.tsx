'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  FileText, 
  Download, 
  File, 
  FileImage, 
  FileVideo, 
  FileAudio,
  FileCode,
  FileSpreadsheet,
  Archive,
  Hash,
  Database,
  Layers
} from 'lucide-react'

interface OriginalFileInfo {
  fileId: string
  fileName: string
  originalName: string
  contentLength: number
  fileSize: number
  url: string
  downloadUrl?: string
  fileType?: string
  jobId: string
  totalChunks: number
  processedChunks: number
  isOneDriveFile: boolean
  oneDriveId?: string
  createdAt: string
  completedAt?: string
}

interface ProcessedFilesListProps {
  processedFiles: any[] // Keep original interface for compatibility
  title?: string
  showContent?: boolean
}

export const ProcessedFilesList: React.FC<ProcessedFilesListProps> = ({
  processedFiles,
  title = "Processed Files",
  showContent = false
}) => {
  // Filter out chunk files and only show original files (those with jobId)
  const originalFiles = React.useMemo(() => {
    return processedFiles.filter(file => 
      file.jobId && // Has jobId (original file)
      file.totalChunks && // Has chunk information
      file.processedChunks !== undefined // Has processing status
    )
  }, [processedFiles])

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="w-4 h-4" />
    
    const type = fileType.toLowerCase()
    if (type.includes('pdf')) return <FileText className="w-4 h-4" />
    if (type.includes('word') || type.includes('doc')) return <FileText className="w-4 h-4" />
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('csv')) return <FileSpreadsheet className="w-4 h-4" />
    if (type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('gif')) return <FileImage className="w-4 h-4" />
    if (type.includes('video') || type.includes('mp4') || type.includes('avi')) return <FileVideo className="w-4 h-4" />
    if (type.includes('audio') || type.includes('mp3') || type.includes('wav')) return <FileAudio className="w-4 h-4" />
    if (type.includes('code') || type.includes('js') || type.includes('ts') || type.includes('py')) return <FileCode className="w-4 h-4" />
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return <Archive className="w-4 h-4" />
    if (type.includes('txt') || type.includes('text')) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = async (file: any) => {
    if (file.downloadUrl && file.downloadUrl !== '') {
      // If we have a download URL, open it directly
      window.open(file.downloadUrl, '_blank')
    } else if (file.isOneDriveFile && file.oneDriveId) {
      // Handle OneDrive files
      try {
        const response = await fetch('/api/onedrive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'download',
            fileId: file.oneDriveId
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.downloadUrl) {
            window.open(data.downloadUrl, '_blank')
          } else {
            alert('Unable to download OneDrive file. Please try again later.')
          }
        } else {
          alert('Unable to download OneDrive file. Please try again later.')
        }
      } catch (error) {
        console.error('OneDrive download error:', error)
        alert('Unable to download OneDrive file. Please try again later.')
      }
    } else {
      // Try to fetch content from the backend using job ID
      try {
        const response = await fetch('/api/document-processing/file-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileId: file.jobId,
            fileName: file.fileName
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.content) {
            // Create a blob and download the content
            const mimeType = getMimeType(file.fileType)
            const blob = new Blob([data.content], { type: mimeType })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = file.fileName
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          } else {
            console.warn('Failed to fetch file content:', data.error)
            alert('Unable to download file. Please try again later.')
          }
        } else {
          console.warn('Failed to fetch file content:', response.statusText)
          alert('Unable to download file. Please try again later.')
        }
      } catch (error) {
        console.error('Download error:', error)
        alert('Unable to download file. Please try again later.')
      }
    }
  }

  const getMimeType = (fileType?: string) => {
    if (!fileType) return 'text/plain'
    
    const type = fileType.toLowerCase()
    if (type.includes('pdf')) return 'application/pdf'
    if (type.includes('word') || type.includes('doc')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('csv')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    if (type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('gif')) return 'image/jpeg'
    if (type.includes('video') || type.includes('mp4') || type.includes('avi')) return 'video/mp4'
    if (type.includes('audio') || type.includes('mp3') || type.includes('wav')) return 'audio/mpeg'
    if (type.includes('code') || type.includes('js') || type.includes('ts') || type.includes('py')) return 'text/plain'
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return 'application/zip'
    if (type.includes('txt') || type.includes('text')) return 'text/plain'
    return 'text/plain'
  }

  if (originalFiles.length === 0) {
    return null
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-green-600" />
          <span>{title}</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {originalFiles.length} files stored
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {originalFiles.map((file, index) => (
            <div key={file.jobId || index}>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {file.originalName}
                      </h4>
                      {file.fileType && (
                        <Badge variant="outline" className="text-xs">
                          {file.fileType.toUpperCase()}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        <Database className="w-3 h-3 mr-1" />
                        Stored
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Hash className="w-3 h-3" />
                        <span>{formatFileSize(file.fileSize)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Layers className="w-3 h-3" />
                        <span>{file.processedChunks}/{file.totalChunks} chunks</span>
                      </span>
                      {file.isOneDriveFile && (
                        <Badge variant="outline" className="text-xs">
                          OneDrive
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Button
                    onClick={() => handleDownload(file)}
                    size="sm"
                    variant="outline"
                    className="flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
