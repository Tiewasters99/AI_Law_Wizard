'use client'

import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Cloud, FileText, Plus, Search, Upload, Settings } from 'lucide-react'
import Image from 'next/image'

interface ServerFile {
  id: string
  fileName: string
  originalName: string
  size: number
  uploadedAt: string
  modifiedAt: string
  path: string
}

interface DocumentSectionProps {
  files: ServerFile[]
  onConnectStorage: () => void
  onStartAnalysis: () => void
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export const DocumentSection = ({ files, onConnectStorage, onStartAnalysis }: DocumentSectionProps) => {
  const getAllFiles = () => {
    return files.filter(file => file.fileName && file.fileName.trim() !== '')
  }

  const allFiles = getAllFiles()
  const hasFiles = allFiles.length > 0
  const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0)

  return (
    <div className="w-full space-y-3">
      {!hasFiles ? (
        <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 relative flex-shrink-0">
                <Image
                  src="/images/ai_law_wizard_logo.svg"
                  alt="AI Law Wizard"
                  fill
                  className="object-contain"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  Start Your Legal Analysis
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  Connect cloud storage to upload documents and begin AI analysis
                </p>
                <Button
                  onClick={onConnectStorage}
                  className="bg-gray-900 hover:bg-gray-800 text-white h-8 px-3 text-sm"
                >
                  <Cloud className="w-3 h-3 mr-1.5" />
                  Connect Storage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Documents Overview */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 relative">
                    <Image
                      src="/images/ai_law_wizard_logo.svg"
                      alt="AI Law Wizard"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {allFiles.length} Document{allFiles.length !== 1 ? 's' : ''} Ready
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(totalSize)} • Ready for analysis
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={onStartAnalysis}
                  className="bg-gray-900 hover:bg-gray-800 text-white h-8 px-3 text-sm"
                >
                  <div className="w-3 h-3 mr-1.5 relative">
                    <Image
                      src="/images/ai_law_wizard_logo.svg"
                      alt="Analyze"
                      fill
                      className="object-contain filter brightness-0 invert"
                    />
                  </div>
                  Analyze
                </Button>
              </div>

              {/* File List Preview */}
              {allFiles.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {allFiles.slice(0, 3).map((file) => (
                    <div key={file.id} className="flex items-center justify-between text-xs bg-gray-50 rounded p-2">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate font-medium text-gray-700">
                          {file.originalName || file.fileName}
                        </span>
                      </div>
                      <span className="text-gray-500 ml-2">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  ))}
                  {allFiles.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{allFiles.length - 3} more files
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={onConnectStorage}
              variant="outline"
              className="h-10 flex-col space-y-0.5 border-gray-200 hover:bg-gray-50"
            >
              <Plus className="w-3 h-3" />
              <span className="text-xs">Add Files</span>
            </Button>
            
            <Button
              onClick={onConnectStorage}
              variant="outline"
              className="h-10 flex-col space-y-0.5 border-gray-200 hover:bg-gray-50"
            >
              <Search className="w-3 h-3" />
              <span className="text-xs">Browse</span>
            </Button>
            
            <Button
              onClick={onConnectStorage}
              variant="outline"
              className="h-10 flex-col space-y-0.5 border-gray-200 hover:bg-gray-50"
            >
              <Settings className="w-3 h-3" />
              <span className="text-xs">Settings</span>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
