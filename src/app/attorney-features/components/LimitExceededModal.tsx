'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { 
  Lock, 
  Crown, 
  Zap, 
  Users, 
  DollarSign, 
  CheckCircle, 
  X,
  Star,
  ArrowRight,
  Clock
} from 'lucide-react'

interface LimitExceededModalProps {
  isOpen: boolean
  onClose: () => void
  featureName: string
  featureDescription: string
  currentUsage: {
    daily: { used: number; limit: number; remaining: number }
    total: { used: number; limit: number; remaining: number }
  }
  onUpgrade: () => void
}

export function LimitExceededModal({
  isOpen,
  onClose,
  featureName,
  featureDescription,
  currentUsage,
  onUpgrade
}: LimitExceededModalProps) {
  const { data: session } = useSession()
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      if (!session) {
        await signIn()
      } else {
        onUpgrade()
      }
    } finally {
      setIsUpgrading(false)
    }
  }

  const premiumFeatures = [
    'Unlimited usage of all features',
    'Advanced AI models (Grok-4)',
    'Priority processing',
    'Advanced analytics',
    'Custom integrations',
    '24/7 premium support'
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-white shadow-2xl border-0">
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Lock className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-gray-900">Limit Reached</CardTitle>
                    <CardDescription className="text-lg">
                      You've reached your free usage limit for {featureName}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Current Usage Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Your Usage</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{currentUsage.daily.used}</div>
                      <div className="text-sm text-gray-600">Used Today</div>
                      <div className="text-xs text-gray-500">Limit: {currentUsage.daily.limit}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{currentUsage.total.used}</div>
                      <div className="text-sm text-gray-600">Total Used</div>
                      <div className="text-xs text-gray-500">Limit: {currentUsage.total.limit}</div>
                    </div>
                  </div>
                </div>

                {/* Feature Description */}
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">{featureName}</h4>
                  <p className="text-gray-600">{featureDescription}</p>
                </div>

                {/* Premium Benefits */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Crown className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-gray-900">Upgrade to Premium</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {premiumFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    size="lg"
                  >
                    {isUpgrading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : session ? (
                      <>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Purchase Tokens
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Sign In to Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    size="lg"
                  >
                    Maybe Later
                  </Button>
                </div>

                {/* Free Trial Info */}
                {!session && (
                  <div className="text-center text-sm text-gray-500">
                    <Star className="w-4 h-4 inline mr-1" />
                    New users get 3 free queries to try premium features
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
