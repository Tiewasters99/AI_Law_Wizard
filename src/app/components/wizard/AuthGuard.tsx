'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Brain, Shield, LogIn } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface AuthGuardProps {
  onSignIn: () => void
}

export const AuthGuard = ({ onSignIn }: AuthGuardProps) => {
  const router = useRouter()

  return (
    <div className="relative">
      {/* Blurred Content */}
      <div className="filter blur-sm pointer-events-none select-none">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              AI Document Wizard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform your documents into actionable insights with powerful AI analysis
            </p>
          </div>
          <div className="space-y-6">
            <Card className="p-8">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Auth Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <Card className="w-full max-w-md mx-4 bg-white shadow-2xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 mx-auto">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Sign In Required
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Please sign in to access the AI Document Wizard and unlock powerful document analysis features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Brain className="w-5 h-5 text-blue-600" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">What you'll get:</p>
                  <p>AI-powered document analysis, insights extraction, and smart recommendations</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={onSignIn}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 h-auto"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In to Continue
            </Button>
            <p className="text-center text-sm text-gray-500">
              Don't have an account? 
              <Button variant="link" className="p-0 ml-1 h-auto" onClick={() => router.push('/register')}>
                Create one here
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
