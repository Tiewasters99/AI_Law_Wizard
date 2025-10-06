'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Coins, AlertTriangle, ArrowRight, Zap, Crown } from 'lucide-react'
import { fetchWallet } from '@/app/lib/stripe'
import Layout from '@/app/components/Layout'

interface TokenGuardProps {
  children: React.ReactNode
  requiredTokens: number
  featureName: string
  featureIcon?: React.ReactNode
  featureDescription?: string
}

export function TokenGuard({ 
  children, 
  requiredTokens, 
  featureName, 
  featureIcon,
  featureDescription 
}: TokenGuardProps) {
  const { data: session } = useSession()
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasEnoughTokens, setHasEnoughTokens] = useState(false)

  useEffect(() => {
    const checkTokens = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        const walletData = await fetchWallet()
        setWallet(walletData)
        setHasEnoughTokens(walletData?.tokens >= requiredTokens)
      } catch (error) {
        console.error('Failed to check tokens:', error)
        setHasEnoughTokens(false)
      } finally {
        setLoading(false)
      }
    }

    checkTokens()
  }, [session, requiredTokens])

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking your tokens...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!session?.user) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to access {featureName}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="w-full"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  if (!hasEnoughTokens) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg"
          >
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {featureIcon || <Coins className="w-10 h-10 text-orange-600" />}
              </div>
              <CardTitle className="text-2xl text-gray-900">
                Insufficient Tokens
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                You need more tokens to access {featureName}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Current Token Status */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Your Current Tokens</span>
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    {wallet?.tokens || 0} tokens
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Required Tokens</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {requiredTokens} tokens
                  </Badge>
                </div>
                <div className="mt-3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(((wallet?.tokens || 0) / requiredTokens) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {requiredTokens - (wallet?.tokens || 0)} more tokens needed
                </p>
              </div>

              {/* Feature Description */}
              {featureDescription && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">What you'll get:</h4>
                      <p className="text-sm text-blue-700">{featureDescription}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.href = '/tokens'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <Coins className="w-5 h-5 mr-2" />
                  Add More Tokens
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="w-full"
                >
                  Go Back
                </Button>
              </div>

              {/* Token Usage Tips */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Crown className="w-4 h-4 mr-2 text-yellow-600" />
                  Token Usage Tips
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Each AI analysis typically uses 1-3 tokens</li>
                  <li>• Complex legal documents may require more tokens</li>
                  <li>• Tokens never expire - use them anytime</li>
                  <li>• Bulk purchases offer better value per token</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </Layout>
    )
  }

  return <>{children}</>
}
