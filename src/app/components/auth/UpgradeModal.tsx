'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { 
  Zap, 
  Crown, 
  Sparkles, 
  ArrowRight, 
  CheckCircle,
  Scale,
  Briefcase,
  Users
} from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentUsage: number
  limit: number
  feature: 'home' | 'directory' | 'attorney-features'
}

export function UpgradeModal({ 
  isOpen, 
  onClose, 
  currentUsage, 
  limit,
  feature
}: UpgradeModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<'limit' | 'role'>('limit')
  const [selectedRole, setSelectedRole] = useState<'ATTORNEY' | 'CUSTOMER' | null>(null)

  const percentage = (currentUsage / limit) * 100
  const showBothRoles = feature === 'home' || feature === 'directory'

  const handleContinue = () => {
    if (showBothRoles) {
      setStep('role')
    } else {
      // Attorney features only - go directly to sign-up with ATTORNEY role
      router.push(`/auth?role=ATTORNEY&feature=${feature}`)
    }
  }

  const handleRoleSelect = (role: 'ATTORNEY' | 'CUSTOMER') => {
    setSelectedRole(role)
    router.push(`/auth?role=${role}&feature=${feature}`)
  }

  const benefits = [
    '5,000 tokens after sign-up',
    'Access to all AI features',
    'Save conversation history',
    'Priority support',
    'Advanced document analysis',
    'No daily limits'
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 'limit' && (
            <motion.div
              key="limit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DialogHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                </div>
                <DialogTitle className="text-2xl text-center">Token Limit Reached</DialogTitle>
                <DialogDescription className="text-center text-base">
                  You've used all your available tokens. Sign up to continue with 5,000 free tokens!
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Usage Display */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Current Usage</span>
                        <span className="text-lg font-bold text-gray-900">
                          {currentUsage.toLocaleString()} / {limit.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-gray-500 text-center">
                        You've reached your anonymous usage limit
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Benefits */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                    What you get with a free account:
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Continue with Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  No credit card required • Get 5,000 free tokens
                </p>
              </div>
            </motion.div>
          )}

          {step === 'role' && (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl text-center">Choose Your Role</DialogTitle>
                <DialogDescription className="text-center text-base">
                  Select the role that best describes you to get started
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 mt-6">
                {/* Attorney Option */}
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedRole === 'ATTORNEY' ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleRoleSelect('ATTORNEY')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Scale className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Attorney</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Legal professional seeking advanced tools and features
                    </p>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      Professional Tools
                    </Badge>
                  </CardContent>
                </Card>

                {/* Customer Option */}
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedRole === 'CUSTOMER' ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => handleRoleSelect('CUSTOMER')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Client</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Individual seeking legal guidance and document help
                    </p>
                    <Badge variant="outline" className="text-purple-600 border-purple-200">
                      Legal Assistance
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <Button
                onClick={() => setStep('limit')}
                variant="ghost"
                className="w-full mt-4"
              >
                Back
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

