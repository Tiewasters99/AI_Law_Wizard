'use client'

import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { FolderOpen, FileCheck, Plus, Cloud, ArrowRight, Brain } from 'lucide-react'

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

export const DocumentSection = ({ files, onConnectStorage, onStartAnalysis }: DocumentSectionProps) => {
  const getAllFiles = () => {
    return files.filter(file => file.fileName && file.fileName.trim() !== '')
  }

  const hasFiles = getAllFiles().length > 0

  return (
    <div className="space-y-6">
      {!hasFiles ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Documents Found
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connect your cloud storage to sync documents and start AI analysis. 
              Your documents will be processed and ready for intelligent insights.
            </p>
            <Button
              onClick={onConnectStorage}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <Cloud className="w-5 h-5 mr-3" />
              Connect Cloud Storage
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Documents Summary */}
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {getAllFiles().length} Documents Ready
                    </h2>
                    <p className="text-gray-600">
                      All files processed and optimized for AI analysis
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={onStartAnalysis}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <Brain className="w-5 h-5 mr-3" />
                  Start AI Analysis
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Add Documents</h4>
                    <p className="text-sm text-gray-500">Connect more storage services</p>
                  </div>
                  <Button
                    onClick={onConnectStorage}
                    variant="outline"
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">View Files</h4>
                    <p className="text-sm text-gray-500">Browse synced files</p>
                  </div>
                  <Button
                    onClick={onConnectStorage}
                    variant="outline"
                    size="sm"
                  >
                    Browse
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
