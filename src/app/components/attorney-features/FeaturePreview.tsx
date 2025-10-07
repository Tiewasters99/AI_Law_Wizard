'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { limitTracker } from '@/app/lib/limitTracker'
import { LimitExceededModal } from './LimitExceededModal'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { 
  Play, 
  Lock, 
  CheckCircle, 
  Clock, 
  Zap, 
  FileText, 
  MessageSquare,
  Search,
  Crown,
  Wand2,
  Briefcase,
  Gavel,
  BarChart3,
  Globe,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react'

interface FeaturePreviewProps {
  featureId: string
  featureName: string
  featureDescription: string
  icon: React.ComponentType<{ className?: string }>
  isFree: boolean
  isLimited: boolean
  onUpgrade: () => void
}

export function FeaturePreview({
  featureId,
  featureName,
  featureDescription,
  icon: Icon,
  isFree,
  isLimited,
  onUpgrade
}: FeaturePreviewProps) {
  const { data: session } = useSession()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewResult, setPreviewResult] = useState<string | null>(null)
  const [canUse, setCanUse] = useState({ canUse: true, remaining: 0 })
  const [usageStats, setUsageStats] = useState({
    daily: { used: 0, limit: 0, remaining: 0 },
    total: { used: 0, limit: 0, remaining: 0 }
  })

  useEffect(() => {
    if (isFree && isLimited) {
      const canUseResult = limitTracker.canUseFeature(featureId)
      const stats = limitTracker.getFeatureStats(featureId)
      setCanUse(canUseResult)
      setUsageStats(stats)
    }
  }, [featureId, isFree, isLimited])

  const handlePreview = async () => {
    if (!session && !isFree) {
      setShowLimitModal(true)
      return
    }

    if (isFree && isLimited) {
      const canUseResult = limitTracker.canUseFeature(featureId)
      if (!canUseResult.canUse) {
        setShowLimitModal(true)
        return
      }
    }

    setIsPreviewOpen(true)
    setIsProcessing(true)

    try {
      // Simulate feature usage
      await simulateFeatureUsage(featureId)
      
      if (isFree && isLimited) {
        limitTracker.useFeature(featureId)
        const newStats = limitTracker.getFeatureStats(featureId)
        setUsageStats(newStats)
      }
    } catch (error) {
      console.error('Preview failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const simulateFeatureUsage = async (featureId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate different results based on feature
        const results = {
          'legal-wizard': 'AI Legal Analysis: Based on your query, I can provide comprehensive legal guidance on contract law, including key elements, enforceability factors, and common pitfalls to avoid.',
          'document-analysis': 'Document Analysis Complete: I\'ve analyzed your document and identified 3 key legal issues, 2 potential risks, and 1 compliance concern. The document appears to be 85% compliant with current regulations.',
          'legal-research': 'Research Results: Found 12 relevant cases, 5 recent precedents, and 3 applicable statutes. The most relevant case is Smith v. Jones (2023) which directly addresses your legal question.',
          'chat-consultation': 'Legal Consultation: I understand your legal concern. Based on the facts provided, I recommend consulting with a specialized attorney in this area. Here are the key legal considerations...',
          'integration-tools': 'File Upload Successful: Your document has been processed and is ready for analysis. You can now run legal analysis, contract review, or other AI-powered legal tools.'
        }
        
        setPreviewResult(results[featureId] || 'Feature preview completed successfully.')
        resolve()
      }, 2000)
    })
  }

  const getFeatureIcon = (featureId: string) => {
    const icons = {
      'legal-wizard': Wand2,
      'document-analysis': FileText,
      'legal-research': Search,
      'chat-consultation': MessageSquare,
      'case-management': Briefcase,
      'contract-drafting': Gavel,
      'legal-analytics': BarChart3,
      'integration-tools': Globe
    }
    return icons[featureId] || FileText
  }

  const getFeatureColor = (featureId: string) => {
    const colors = {
      'legal-wizard': 'text-purple-600 bg-purple-100',
      'document-analysis': 'text-blue-600 bg-blue-100',
      'legal-research': 'text-green-600 bg-green-100',
      'chat-consultation': 'text-orange-600 bg-orange-100',
      'case-management': 'text-indigo-600 bg-indigo-100',
      'contract-drafting': 'text-red-600 bg-red-100',
      'legal-analytics': 'text-pink-600 bg-pink-100',
      'integration-tools': 'text-cyan-600 bg-cyan-100'
    }
    return colors[featureId] || 'text-gray-600 bg-gray-100'
  }

  return (
    <>
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getFeatureColor(featureId)}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{featureName}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  {isFree ? (
                    <Badge variant="secondary" className="text-green-600 bg-green-50">
                      Free Preview
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                      Premium
                    </Badge>
                  )}
                  {isLimited && canUse.remaining > 0 && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      {canUse.remaining} left
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {!session && !isFree && <Lock className="w-4 h-4 text-gray-400" />}
          </div>
        </CardHeader>
        
        <CardContent>
          <CardDescription className="mb-4">
            {featureDescription}
          </CardDescription>
          
          {/* Usage Stats for Free Features */}
          {isFree && isLimited && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Daily Usage:</span>
                <span className="font-medium">
                  {usageStats.daily.used}/{usageStats.daily.limit}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Total Usage:</span>
                <span className="font-medium">
                  {usageStats.total.used}/{usageStats.total.limit}
                </span>
              </div>
            </div>
          )}

          <Button 
            onClick={handlePreview}
            disabled={isProcessing || (!canUse.canUse && isFree && isLimited)}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : !canUse.canUse && isFree && isLimited ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Limit Reached
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Try Preview
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
                      <div className={`p-2 rounded-lg ${getFeatureColor(featureId)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{featureName} Preview</CardTitle>
                        <CardDescription>Experience this feature with limited functionality</CardDescription>
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
                      <h3 className="text-lg font-semibold mb-2">Processing Your Request</h3>
                      <p className="text-gray-600">This is a preview of how the feature works...</p>
                    </div>
                  ) : previewResult ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-800">Preview Complete</span>
                        </div>
                        <p className="text-green-700">{previewResult}</p>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-800">Preview Mode</span>
                        </div>
                        <p className="text-blue-700">
                          This is a limited preview. Sign in and purchase tokens for full access to unlimited usage, 
                          advanced features, and complete functionality.
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
        featureName={featureName}
        featureDescription={featureDescription}
        currentUsage={usageStats}
        onUpgrade={onUpgrade}
      />
    </>
  )
}
