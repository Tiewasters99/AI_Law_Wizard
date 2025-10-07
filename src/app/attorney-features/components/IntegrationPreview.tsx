'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { limitTracker } from '@/app/lib/limitTracker'
import { LimitExceededModal } from './LimitExceededModal'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  X, 
  Globe,
  Lock,
  Play,
  ArrowRight,
  Crown
} from 'lucide-react'

interface IntegrationPreviewProps {
  onUpgrade: () => void
}

export function IntegrationPreview({ onUpgrade }: IntegrationPreviewProps) {
  const { data: session } = useSession()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewResult, setPreviewResult] = useState<string | null>(null)
  const [canUse, setCanUse] = useState({ canUse: true, remaining: 0 })
  const [usageStats, setUsageStats] = useState({
    daily: { used: 0, limit: 0, remaining: 0 },
    total: { used: 0, limit: 0, remaining: 0 }
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const canUseResult = limitTracker.canUseFeature('integration-tools')
    const stats = limitTracker.getFeatureStats('integration-tools')
    setCanUse(canUseResult)
    setUsageStats(stats)
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handlePreview = async () => {
    if (!session) {
      setShowLimitModal(true)
      return
    }

    const canUseResult = limitTracker.canUseFeature('integration-tools')
    if (!canUseResult.canUse) {
      setShowLimitModal(true)
      return
    }

    if (!uploadedFile) {
      alert('Please upload a file first')
      return
    }

    setIsPreviewOpen(true)
    setIsProcessing(true)

    try {
      // Simulate file processing
      await simulateFileProcessing()
      
      limitTracker.useFeature('integration-tools')
      const newStats = limitTracker.getFeatureStats('integration-tools')
      setUsageStats(newStats)
    } catch (error) {
      console.error('Preview failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const simulateFileProcessing = async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setPreviewResult(`Document Analysis Complete: I've analyzed your uploaded document "${uploadedFile?.name}" and identified key legal elements, potential issues, and compliance requirements. The document appears to be 78% compliant with current legal standards.`)
        resolve()
      }, 3000)
    })
  }

  return (
    <>
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cyan-100">
                <Globe className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Integration Tools</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    Free Preview
                  </Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {canUse.remaining} left
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <CardDescription className="mb-4">
            Connect with external legal databases and tools. Upload documents for AI-powered analysis.
          </CardDescription>
          
          {/* File Upload Section */}
          <div className="mb-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {uploadedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{uploadedFile.name}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUploadedFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <div 
                  className="space-y-2 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload a document</p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT files supported</p>
                </div>
              )}
            </div>
          </div>

          <Button 
            onClick={handlePreview}
            disabled={isProcessing || !uploadedFile || !canUse.canUse}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : !canUse.canUse ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Limit Reached
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Analyze Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-white shadow-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-cyan-100">
                        <Globe className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Integration Tools Preview</CardTitle>
                        <CardDescription>Document analysis with AI-powered legal insights</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsPreviewOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {isProcessing ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <h3 className="text-lg font-semibold mb-2">Analyzing Your Document</h3>
                      <p className="text-gray-600">Processing legal content and extracting key insights...</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span>Extracting text content</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span>Identifying legal elements</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span>Running compliance checks</span>
                        </div>
                      </div>
                    </div>
                  ) : previewResult ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-800">Analysis Complete</span>
                        </div>
                        <p className="text-green-700">{previewResult}</p>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-800">Preview Mode</span>
                        </div>
                        <p className="text-blue-700">
                          This is a limited preview. Sign in and purchase tokens for full access to unlimited document analysis, 
                          advanced AI models, and complete legal insights.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setIsPreviewOpen(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Close Preview
                    </Button>
                    <Button
                      onClick={() => {
                        setIsPreviewOpen(false)
                        onUpgrade()
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade for Full Access
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Limit Exceeded Modal */}
      <LimitExceededModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        featureName="Integration Tools"
        featureDescription="Upload and analyze legal documents with AI-powered insights"
        currentUsage={usageStats}
        onUpgrade={onUpgrade}
      />
    </>
  )
}
