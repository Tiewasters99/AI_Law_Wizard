'use client'

import { Button } from '@/app/components/ui/button'
import { Crown, Zap, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { getSubscriptionTier } from '@/app/lib/subscription'
import Image from 'next/image'

interface ChatHeaderProps {
  isClient: boolean
  onUpgrade: () => void
}

export default function ChatHeader({ isClient, onUpgrade }: ChatHeaderProps) {
  const subscriptionTier = isClient ? getSubscriptionTier() : null

  const getSubscriptionIcon = () => {
    switch (subscriptionTier) {
      case 'silver':
        return <Star className="w-4 h-4" />
      case 'gold':
        return <Crown className="w-4 h-4" />
      case 'platinum':
        return <Zap className="w-4 h-4" />
      default:
        return null
    }
  }

  const getSubscriptionLabel = () => {
    switch (subscriptionTier) {
      case 'silver':
        return 'Pro'
      case 'gold':
        return 'Pro'
      case 'platinum':
        return 'Platinum'
      default:
        return null
    }
  }

  const getSubscriptionGradient = () => {
    switch (subscriptionTier) {
      case 'silver':
        return 'from-gray-600 to-gray-700'
      case 'gold':
        return 'from-yellow-500 to-amber-600'
      case 'platinum':
        return 'from-purple-600 to-indigo-700'
      default:
        return 'from-blue-600 to-purple-600'
    }
  }

  return (
    <motion.div 
      className="p-4 sm:p-6 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.6 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <Image 
              src="/images/ai_law_wizard_logo.svg" 
              alt="AI Law Wizard" 
              width={24} 
              height={24}
              className="w-6 h-6 flex-shrink-0"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Chat with <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                {subscriptionTier ? 'Grok' : 'Apprentice'}
              </span>
            </h1>
          </div>
          <p className="text-sm text-gray-600">Ask me anything about legal matters</p>
        </div>
        <div className="flex items-center gap-2">
          {isClient && subscriptionTier && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Button
                variant="default"
                size="sm"
                className={`flex items-center gap-2 bg-gradient-to-r ${getSubscriptionGradient()} hover:from-blue-700 hover:to-purple-700 text-white`}
                onClick={onUpgrade}
              >
                {getSubscriptionIcon()}
                <span className="hidden sm:inline">{getSubscriptionLabel()}</span>
              </Button>
            </motion.div>
          )}
          {isClient && !subscriptionTier && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Button
                onClick={onUpgrade}
                variant="default"
                size="sm"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">Upgrade</span>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
