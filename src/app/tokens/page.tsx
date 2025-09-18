'use client'

import { motion } from 'framer-motion'
import Layout from '@/app/components/Layout'
import { TokenPurchase } from '@/app/components/payment/TokenPurchase'
import { Coins, TrendingUp, History, Settings, CreditCard, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { fetchWallet } from '@/app/lib/stripe'

export default function TokensPage() {
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    const loadWallet = async () => {
      if (session?.user) {
        try {
          const walletData = await fetchWallet()
          setWallet(walletData)
        } catch (error) {
          console.error('Failed to load wallet:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    loadWallet()
  }, [session])

  const tokenStats = [
    {
      title: 'Total Tokens',
      value: wallet?.tokens || 0,
      icon: Coins,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Used This Month',
      value: 0, // This would come from usage analytics
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Purchase History',
      value: 0, // This would come from transaction history
      icon: History,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  const quickActions = [
    {
      title: 'Buy More Tokens',
      description: 'Purchase additional tokens for AI analysis',
      icon: CreditCard,
      action: 'purchase'
    },
    {
      title: 'Usage Analytics',
      description: 'View detailed usage statistics',
      icon: TrendingUp,
      action: 'analytics'
    },
    {
      title: 'Transaction History',
      description: 'View all your token transactions',
      icon: History,
      action: 'history'
    },
    {
      title: 'Auto-Recharge',
      description: 'Set up automatic token purchases',
      icon: Settings,
      action: 'settings'
    }
  ]

  return (
    <Layout>
      <motion.div 
        className="min-h-[calc(100vh-200px)] bg-white/90 backdrop-blur-sm shadow-2xl rounded-lg mx-auto max-w-6xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Token Management
            </h1>
            <p className="text-gray-600 mt-2">Manage your AI analysis tokens and purchases</p>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            <Badge variant="secondary" className="text-sm">
              AI Powered
            </Badge>
          </div>
        </div>

        {/* Token Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {tokenStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{action.title}</h3>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Token Purchase Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Purchase Tokens</h2>
          <Card>
            <CardContent className="p-6">
              <TokenPurchase showWallet={true} />
            </CardContent>
          </Card>
        </div>

        {/* Usage Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Token Usage Tips</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Each AI analysis typically uses 1-3 tokens</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Complex legal documents may require more tokens</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Tokens never expire - use them anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Bulk purchases offer better value per token</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  )
}
