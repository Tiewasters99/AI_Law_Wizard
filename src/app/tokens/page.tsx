'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { TokenPurchase } from '@/app/components/payment/TokenPurchase'
import { colors } from '@/app/lib/designSystem'
import { Coins, TrendingUp, History, Settings, CreditCard, Award, Shield, FileText, BarChart3, Clock, Scale } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { useState, useEffect, useMemo } from 'react'
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
  }, [session?.user])

  const isAttorney = useMemo(
    () => session?.user?.role === 'ATTORNEY' || session?.user?.role === 'LAWYER',
    [session?.user?.role]
  );

  const serviceStats = useMemo(() => [
    {
      title: 'Available Credits',
      value: wallet?.tokens || 0,
      icon: Coins,
      iconColor: colors.primary[700],
      bgColor: colors.primary[50],
      borderColor: colors.primary[200]
    },
    {
      title: 'Credits Used',
      value: 0, // This would come from usage analytics
      icon: BarChart3,
      iconColor: colors.success[700],
      bgColor: colors.success[50],
      borderColor: colors.success[200]
    },
    {
      title: 'Transaction History',
      value: 0, // This would come from transaction history
      icon: History,
      iconColor: colors.secondary[700],
      bgColor: colors.secondary[50],
      borderColor: colors.secondary[200]
    }
  ], [wallet?.tokens])

  const professionalActions = useMemo(() => [
    {
      title: 'Purchase Credits',
      description: 'Acquire analysis credits for legal services',
      icon: CreditCard,
      action: 'purchase'
    },
    {
      title: 'Usage Reports',
      description: 'Comprehensive usage analytics and insights',
      icon: BarChart3,
      action: 'analytics'
    },
    {
      title: 'Transaction Records',
      description: 'Complete transaction history and invoices',
      icon: History,
      action: 'history'
    },
    {
      title: 'Firm Packages',
      description: 'Enterprise solutions for law firms',
      icon: Scale,
      action: 'settings'
    }
  ], [])

  return (
    <div className="h-full overflow-y-auto">
      <motion.div 
        className="bg-white mx-auto max-w-6xl p-4 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Professional Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b" style={{ borderColor: colors.secondary[200] }}>
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: colors.primary[700] }}>
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
                  Service Credit Management
                </h1>
                {isAttorney && (
                  <Badge variant="outline" className="mt-1" style={{ 
                    color: colors.accent[700],
                    backgroundColor: colors.accent[50],
                    borderColor: colors.accent[200]
                  }}>
                    <Award className="w-3 h-3 mr-1" />
                    Attorney Account
                  </Badge>
                )}
              </div>
            </div>
            <p className="mt-2" style={{ color: colors.secondary[600] }}>Professional legal analysis credits for AI-powered services</p>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-lg border" style={{ 
            backgroundColor: colors.primary[50],
            borderColor: colors.primary[200]
          }}>
            <Shield className="w-5 h-5" style={{ color: colors.primary[700] }} />
            <span className="text-sm font-semibold" style={{ color: colors.primary[900] }}>Secure Platform</span>
          </div>
        </div>

        {/* Professional Service Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {serviceStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow border" style={{ borderColor: stat.borderColor }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium mb-1" style={{ color: colors.secondary[700] }}>{stat.title}</p>
                        <p className="text-3xl font-bold" style={{ color: colors.text }}>{stat.value}</p>
                      </div>
                      <div className="p-3 rounded-lg" style={{ backgroundColor: stat.bgColor }}>
                        <Icon className="w-6 h-6" style={{ color: stat.iconColor }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Professional Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Credit Management</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {professionalActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow border" style={{ borderColor: colors.secondary[200] }}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary[50] }}>
                          <Icon className="w-5 h-5" style={{ color: colors.primary[700] }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm mb-1" style={{ color: colors.text }}>{action.title}</h3>
                          <p className="text-xs" style={{ color: colors.secondary[600] }}>{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Professional Credit Purchase Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Purchase Service Credits</h2>
          <Card className="border shadow-sm" style={{ borderColor: colors.secondary[200] }}>
            <CardContent className="p-6">
              <TokenPurchase showWallet={true} />
            </CardContent>
          </Card>
        </div>

        {/* Professional Usage Information */}
        <div className="rounded-xl p-6 border" style={{ 
          backgroundColor: colors.secondary[50],
          borderColor: colors.secondary[200]
        }}>
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-5 h-5" style={{ color: colors.primary[700] }} />
            <h3 className="text-lg font-semibold" style={{ color: colors.text }}>Service Credit Information</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold mb-2" style={{ color: colors.primary[900] }}>Credit Usage</h4>
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 mt-0.5" style={{ color: colors.primary[700] }} />
                <span className="text-sm" style={{ color: colors.secondary[700] }}>Standard legal analysis: 1-3 credits per query</span>
              </div>
              <div className="flex items-start space-x-2">
                <FileText className="w-4 h-4 mt-0.5" style={{ color: colors.primary[700] }} />
                <span className="text-sm" style={{ color: colors.secondary[700] }}>Complex document processing: 3-5 credits per document</span>
              </div>
              <div className="flex items-start space-x-2">
                <Image 
                  src="/logo_icon.png" 
                  alt="AI Wizard Logo" 
                  width={16} 
                  height={16}
                  className="mt-0.5"
                />
                <span className="text-sm" style={{ color: colors.secondary[700] }}>Advanced case law research: 5-10 credits per session</span>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold mb-2" style={{ color: colors.success[900] }}>Professional Benefits</h4>
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 mt-0.5" style={{ color: colors.success[700] }} />
                <span className="text-sm" style={{ color: colors.secondary[700] }}>Credits never expire - lifetime validity</span>
              </div>
              <div className="flex items-start space-x-2">
                <Award className="w-4 h-4 mt-0.5" style={{ color: colors.success[700] }} />
                <span className="text-sm" style={{ color: colors.secondary[700] }}>Volume discounts for law firm packages</span>
              </div>
              <div className="flex items-start space-x-2">
                <BarChart3 className="w-4 h-4 mt-0.5" style={{ color: colors.success[700] }} />
                <span className="text-sm" style={{ color: colors.secondary[700] }}>Detailed usage analytics and reporting</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
