'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { TokenPurchase } from '../payment/TokenPurchase'
import Image from 'next/image'

interface TokenGuardProps {
  onTokenPurchaseSuccess: (tokens: number) => void
}

export const TokenGuard = ({ onTokenPurchaseSuccess }: TokenGuardProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto px-4 py-8 lg:py-12 xl:px-8 2xl:px-16">
        {/* Hero Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-blue-600 rounded-3xl mb-6 shadow-lg">
            <Image 
              src="/images/ai_law_wizard_logo.svg" 
              alt="AI Law Wizard Logo" 
              width={48} 
              height={48} 
              className="w-10 h-10 lg:w-12 lg:h-12"
            />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4 lg:mb-6">
            AI Law Wizard
          </h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                Get Started with AI Law Wizard
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Purchase tokens to unlock powerful AI document analysis features
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 xl:p-12">
              <TokenPurchase 
                onSuccess={onTokenPurchaseSuccess}
                showWallet={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
