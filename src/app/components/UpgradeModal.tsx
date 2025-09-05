'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { X, Check, Crown, Zap, Star } from 'lucide-react'
import { pricingTiers } from '@/app/lib/pricing'
import { setUserSubscription, getSubscriptionTier } from '@/app/lib/subscription'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentUsage: number
}

export default function UpgradeModal({ isOpen, onClose, currentUsage }: UpgradeModalProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(null)

  // Use useEffect to get subscription on client side only
  useEffect(() => {
    setCurrentSubscription(getSubscriptionTier())
  }, [])

  if (!isOpen) return null

  const handleUpgrade = (tierId: string) => {
    // In a real app, this would redirect to payment processing
    console.log(`Upgrading to ${tierId} tier`)
    
    // Simulate successful payment and set subscription
    setUserSubscription(tierId as 'silver' | 'gold' | 'platinum')
    
    alert(`Successfully upgraded to ${tierId} plan! You now have unlimited access.`)
    onClose()
    
    // Refresh the page to update the UI
    window.location.reload()
  }

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'silver':
        return <Star className="w-5 h-5" />
      case 'gold':
        return <Crown className="w-5 h-5" />
      case 'platinum':
        return <Zap className="w-5 h-5" />
      default:
        return <Star className="w-5 h-5" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentSubscription ? 'Manage Subscription' : 'Upgrade to Pro'}
            </h2>
            <p className="text-gray-600 mt-1">
              {currentSubscription 
                ? `You're currently on the ${currentSubscription} plan. View all available plans below.`
                : `You've used ${currentUsage} of 2 free chats. Upgrade to continue chatting with Grok!`
              }
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Pricing Tiers */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
                              <Card
                  key={tier.id}
                  className={`relative transition-all hover:shadow-lg ${
                    selectedTier === tier.id ? 'ring-2 ring-blue-500' : ''
                  } ${tier.popular ? 'border-blue-500' : ''} ${
                    currentSubscription === tier.id ? 'cursor-default' : 'cursor-pointer'
                  }`}
                  onClick={() => {
                    if (currentSubscription !== tier.id) {
                      setSelectedTier(tier.id)
                    }
                  }}
                >
                {currentSubscription === tier.id && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-3 py-1">
                      Current Plan
                    </Badge>
                  </div>
                )}
                {tier.popular && !currentSubscription && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center mb-2">
                    {getTierIcon(tier.id)}
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{tier.description}</p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">${tier.price}</span>
                    <span className="text-gray-600">/{tier.period}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {tier.chatLimit} chats per month
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      currentSubscription === tier.id
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : selectedTier === tier.id
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (currentSubscription !== tier.id) {
                        handleUpgrade(tier.id)
                      }
                    }}
                    disabled={currentSubscription === tier.id}
                  >
                    {currentSubscription === tier.id 
                      ? 'Current Plan' 
                      : selectedTier === tier.id 
                      ? 'Selected' 
                      : 'Choose Plan'
                    }
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">
              All plans include a 7-day free trial. Cancel anytime.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>🔒 Secure payment</span>
              <span>💳 No setup fees</span>
              <span>🔄 Easy cancellation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
