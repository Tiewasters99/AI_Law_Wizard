'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { 
  Cloud, 
  FileText, 
  Plus, 
  RefreshCw, 
  ArrowRight, 
  Upload,
  FolderOpen,
  Coins
} from 'lucide-react'
import { Wallet } from '../../../lib/stripe'

interface ServerFile {
  id: string
  fileName: string
  originalName: string
  size: number
  uploadedAt: string
  modifiedAt: string
  path: string
}

interface DocumentStepProps {
  files: ServerFile[]
  wallet: Wallet | null
  onConnectStorage: () => void
  onTokenPurchase: () => void
  onStartAnalysis: () => void
  onRefreshFiles: () => void
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export const DocumentStep = ({ 
  files, 
  wallet, 
  onConnectStorage, 
  onTokenPurchase, 
  onStartAnalysis,
  onRefreshFiles 
}: DocumentStepProps) => {
  const getAllFiles = () => {
    return files.filter(file => file.fileName && file.fileName.trim() !== '')
  }

  const allFiles = getAllFiles()
  const hasFiles = allFiles.length > 0
  const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0)
  const hasEnoughTokens = wallet && wallet.tokens >= 1

  if (!hasFiles) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-8 h-8 text-gray-400" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            No Documents Found
          </h2>
          
          <p className="text-gray-600 mb-8">
            Connect your cloud storage to sync documents and start AI analysis.
          </p>

          <div className="space-y-3">
            <Button
              onClick={onConnectStorage}
              size="lg"
              className="w-full"
            >
              <Cloud className="w-5 h-5 mr-2" />
              Connect Cloud Storage
            </Button>
            
            <Button
              onClick={onRefreshFiles}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh Files
            </Button>
          </div>

          {/* Quick tips */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
            <h3 className="font-medium text-blue-900 mb-2">Supported Sources:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• OneDrive integration</li>
              <li>• PDF, Word, and text documents</li>
              <li>• Automatic sync and processing</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Documents Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Files Summary */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {allFiles.length} Document{allFiles.length !== 1 ? 's' : ''} Ready
                </CardTitle>
                <Button
                  onClick={onRefreshFiles}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total size: {formatFileSize(totalSize)}</span>
                <span>Ready for analysis</span>
              </div>

              {/* File List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allFiles.slice(0, 10).map((file, index) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.originalName || file.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {allFiles.length > 10 && (
                  <div className="text-center py-2">
                    <Button
                      onClick={onConnectStorage}
                      variant="link"
                      size="sm"
                      className="text-blue-600"
                    >
                      View all {allFiles.length} files
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-4">
          {/* Token Status */}
          {wallet && (
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Coins className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {wallet.tokens}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Analysis Credits
                  </div>
                  
                  {!hasEnoughTokens && (
                    <Button
                      onClick={onTokenPurchase}
                      size="sm"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Buy Credits
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button
                onClick={onStartAnalysis}
                disabled={!hasEnoughTokens}
                size="lg"
                className="w-full"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Start Analysis
              </Button>

              <Button
                onClick={onConnectStorage}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add More Files
              </Button>

              {!hasEnoughTokens && (
                <p className="text-xs text-amber-600 text-center">
                  You need at least 1 credit to start analysis
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <Button
                onClick={onConnectStorage}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
              
              <Button
                onClick={onConnectStorage}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <Cloud className="w-4 h-4 mr-2" />
                Manage Integrations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
