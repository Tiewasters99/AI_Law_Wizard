'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  Download, 
  Eye, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Archive, 
  X, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  Loader2, 
  AlertCircle 
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { useToast } from '../ui/use-toast'

interface DocumentViewerProps {
  fileId: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl?: string
  isOpen: boolean
  onClose: () => void
  onDownload?: (fileId: string) => void
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />
  if (fileType.includes('image')) return <ImageIcon className="w-8 h-8 text-blue-500" />
  if (fileType.includes('video')) return <Video className="w-8 h-8 text-purple-500" />
  if (fileType.includes('audio')) return <Music className="w-8 h-8 text-green-500" />
  if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="w-8 h-8 text-orange-500" />
  return <FileText className="w-8 h-8 text-gray-500" />
}

const getFileTypeLabel = (fileType: string) => {
  if (fileType.includes('pdf')) return 'PDF Document'
  if (fileType.includes('image')) return 'Image'
  if (fileType.includes('video')) return 'Video'
  if (fileType.includes('audio')) return 'Audio'
  if (fileType.includes('zip') || fileType.includes('rar')) return 'Archive'
  if (fileType.includes('text')) return 'Text Document'
  if (fileType.includes('word') || fileType.includes('document')) return 'Word Document'
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'Spreadsheet'
  return 'Document'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function DocumentViewer({ 
  fileId, 
  fileName, 
  fileType, 
  fileSize, 
  fileUrl, 
  isOpen, 
  onClose, 
  onDownload 
}: DocumentViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && fileUrl) {
      setLoading(true)
      setError(null)
      setViewerUrl(fileUrl)
      setLoading(false)
    }
  }, [isOpen, fileUrl])

  const handleDownload = async () => {
    if (onDownload) {
      try {
        setLoading(true)
        await onDownload(fileId)
        toast({
          title: 'Download Started',
          description: `Downloading ${fileName}...`
        })
      } catch (error) {
        toast({
          title: 'Download Failed',
          description: 'Failed to download file',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleViewInNewTab = () => {
    if (viewerUrl) {
      window.open(viewerUrl, '_blank')
    }
  }

  const canPreview = fileType.includes('pdf') || 
                    fileType.includes('image') || 
                    fileType.includes('text') ||
                    fileType.includes('word') ||
                    fileType.includes('document')

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: 50 }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden ${
              isFullscreen ? 'fixed inset-4' : ''
            }`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-3">
                {getFileIcon(fileType)}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 truncate max-w-md">
                    {fileName}
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Badge variant="secondary" className="text-xs">
                      {getFileTypeLabel(fileType)}
                    </Badge>
                    <span>{formatFileSize(fileSize)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {canPreview && viewerUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewInNewTab}
                    className="flex items-center space-x-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in New Tab</span>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="flex items-center space-x-1"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={loading}
                  className="flex items-center space-x-1"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Download</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="flex items-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Loading document...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Document</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={handleViewInNewTab} variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Try Opening in New Tab
                    </Button>
                  </div>
                </div>
              ) : canPreview && viewerUrl ? (
                <div className="space-y-4">
                  {/* PDF Viewer */}
                  {fileType.includes('pdf') && (
                    <div className="w-full h-[600px] border rounded-lg overflow-hidden">
                      <iframe
                        src={viewerUrl}
                        className="w-full h-full"
                        title={fileName}
                        onError={() => setError('Failed to load PDF preview')}
                      />
                    </div>
                  )}
                  
                  {/* Image Viewer */}
                  {fileType.includes('image') && (
                    <div className="flex justify-center">
                      <Image
                        src={viewerUrl}
                        alt={fileName}
                        width={800}
                        height={600}
                        className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
                        onError={() => setError('Failed to load image')}
                      />
                    </div>
                  )}
                  
                  {/* Text Viewer */}
                  {(fileType.includes('text') || fileType.includes('word') || fileType.includes('document')) && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="text-sm text-gray-600 mb-2">
                        Preview not available for this file type. Click &ldquo;Open in New Tab&rdquo; to view the document.
                      </div>
                      <Button onClick={handleViewInNewTab} variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="mb-4">
                      {getFileIcon(fileType)}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {getFileTypeLabel(fileType)}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Preview not available for this file type. You can download the file to view it.
                    </p>
                    <div className="flex items-center justify-center space-x-3">
                      <Button onClick={handleDownload} disabled={loading}>
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Download File
                      </Button>
                      {viewerUrl && (
                        <Button onClick={handleViewInNewTab} variant="outline">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open in New Tab
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
