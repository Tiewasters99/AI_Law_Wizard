'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { 
  X, 
  Lock, 
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

interface InteractiveFeaturePanelProps {
  isOpen: boolean
  onClose: () => void
  featureId: string
  featureName: string
  featureDescription: string
  icon: React.ComponentType<{ className?: string }>
  isFree: boolean
  isLimited: boolean
  onUpgrade: () => void
  children?: React.ReactNode
}

export function InteractiveFeaturePanel({
  isOpen,
  onClose,
  featureId,
  featureName,
  featureDescription,
  icon: Icon,
  isFree,
  isLimited,
  onUpgrade,
  children
}: InteractiveFeaturePanelProps) {
  const { data: session } = useSession()
  const [triesUsed, setTriesUsed] = useState(0)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const MAX_FREE_TRIES = 2

  useEffect(() => {
    // Load tries from localStorage for guests
    if (!session) {
      const storedTries = localStorage.getItem(`attorney_feature_${featureId}_tries`)
      if (storedTries) {
        setTriesUsed(parseInt(storedTries, 10))
      }
    }
  }, [featureId, session, isOpen])

  const handleFeatureUse = () => {
    if (!session) {
      const newTriesUsed = triesUsed + 1
      setTriesUsed(newTriesUsed)
      localStorage.setItem(`attorney_feature_${featureId}_tries`, newTriesUsed.toString())
      
      // Show login prompt after first successful use (immediately after first analysis)
      if (newTriesUsed === 1) {
        setShowLoginPrompt(true)
      }
    }
  }

  const canUseFreebie = !session && triesUsed < 1 // Only 1 try for document upload
  const isLawyer = session?.user?.role === 'ATTORNEY' || session?.user?.role === 'LAWYER'
  const remainingTries = 1 - triesUsed // Only 1 free try

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Panel Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{featureName}</h2>
                    <p className="text-blue-100 text-sm">{featureDescription}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {!session && triesUsed === 0 && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                    Free Trial - 1 Analysis
                  </Badge>
                )}
                {!session && triesUsed >= 1 && (
                  <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                    Trial Used - Sign In for More
                  </Badge>
                )}
                {isLawyer && (
                  <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                    Unlimited Access
                  </Badge>
                )}
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Usage Notice for Guests */}
              {!session && canUseFreebie && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 mb-1">Try Document Analysis Free</h3>
                      <p className="text-sm text-green-700 mb-3">
                        Upload one document and ask one question to try this feature. 
                        Sign in as a lawyer for unlimited access.
                      </p>
                      <Button
                        onClick={onUpgrade}
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-700 hover:bg-green-600 hover:text-white"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Sign In to Continue
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Feature Component */}
              {(canUseFreebie || isLawyer) ? (
                <div className="bg-gray-50 rounded-lg p-6 min-h-[400px]">
                  {children}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Lock className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Continue as a Lawyer
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      You've completed your free trial. Sign in or create a lawyer account to unlock unlimited document analysis, advanced features, and professional legal tools.
                    </p>
                    <div className="space-y-3">
                      <Button
                        onClick={onUpgrade}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                        size="lg"
                      >
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Sign In as Lawyer
                      </Button>
                      <p className="text-xs text-gray-500">
                        Get unlimited access to all professional legal features
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="p-4 border-t bg-gray-50 flex-shrink-0">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


