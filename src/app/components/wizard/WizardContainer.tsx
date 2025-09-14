'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '../ui/card'
import { fetchWallet, consumeTokens, Wallet } from '../../lib/stripe'
import { StepIndicator } from './StepIndicator'
import { DocumentStep } from './steps/DocumentStep'
import { AnalysisStep } from './steps/AnalysisStep'
import { AuthGuard } from './AuthGuard'
import { TokenGuard } from './TokenGuard'
import { NotificationBanner } from './NotificationBanner'
import { ClockIcon } from '@heroicons/react/24/outline'

interface ServerFile {
  id: string
  fileName: string
  originalName: string
  size: number
  uploadedAt: string
  modifiedAt: string
  path: string
}

export type WizardStep = 'documents' | 'analysis'

const STEPS = [
  { id: 'documents', title: 'Documents', description: 'Upload and manage your files' },
  { id: 'analysis', title: 'Analysis', description: 'AI-powered document analysis' }
] as const

export const WizardContainer = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get current step from URL
  const currentStepParam = searchParams.get('step') as WizardStep
  const [currentStep, setCurrentStep] = useState<WizardStep>(currentStepParam || 'documents')
  
  // State management
  const [serverFiles, setServerFiles] = useState<ServerFile[]>([])
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [grokResult, setGrokResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showTokenPurchase, setShowTokenPurchase] = useState(false)

  // Authentication and data loading
  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      setLoading(false)
      return
    }

    Promise.all([
      fetchServerFiles(),
      loadWallet()
    ]).finally(() => setLoading(false))

    // Check for payment success
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('payment') === 'success') {
      setPaymentSuccess(true)
      loadWallet()
      window.history.replaceState({}, '', '/wizard')
      setTimeout(() => setPaymentSuccess(false), 5000)
    }
  }, [session, status])

  // Update URL when step changes
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('step', currentStep)
    window.history.replaceState({}, '', url.toString())
  }, [currentStep])

  const loadWallet = async () => {
    try {
      const walletData = await fetchWallet()
      setWallet(walletData)
    } catch (err) {
      console.error('Failed to load wallet:', err)
    }
  }

  const fetchServerFiles = async () => {
    try {
      const response = await fetch('/api/files')
      if (!response.ok) throw new Error('Failed to fetch files')
      
      const data = await response.json()
      if (data.success) {
        setServerFiles(data.files || [])
      }
    } catch (error) {
      console.error('Error fetching files:', error)
      setError('Failed to load files')
    }
  }

  const navigateToStep = (stepId: string) => {
    setCurrentStep(stepId as WizardStep)
  }

  const navigateToCloudStorage = () => {
    router.push('/integrations')
  }

  const checkTokenRequirement = (): boolean => {
    return Boolean(wallet && wallet.tokens >= 1)
  }

  const handleTokenPurchaseSuccess = (tokens: number) => {
    setShowTokenPurchase(false)
    loadWallet()
    if (currentStep === 'documents') {
      setCurrentStep('analysis')
    }
  }

  const handleAnalysisStart = async () => {
    if (!checkTokenRequirement()) {
      setShowTokenPurchase(true)
      return false
    }

    try {
      await consumeTokens(1)
      await loadWallet()
      return true
    } catch (error) {
      console.error('Failed to consume tokens:', error)
      setError('Failed to start analysis. Please try again.')
      return false
    }
  }

  const handleAnalysisComplete = (result: string) => {
    setGrokResult(result)
  }

  const handleNewAnalysis = () => {
    setGrokResult(null)
  }

  // Auth Guard
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session?.user) {
    return <AuthGuard onSignIn={() => router.push('/login')} />
  }

  // Token Guard
  if (wallet && wallet.tokens < 1 && !showTokenPurchase) {
    return <TokenGuard onTokenPurchaseSuccess={handleTokenPurchaseSuccess} />
  }

  // Token Purchase Modal
  if (showTokenPurchase) {
    return <TokenGuard onTokenPurchaseSuccess={handleTokenPurchaseSuccess} />
  }

  const getAllFiles = () => {
    return serverFiles.filter(file => file.fileName && file.fileName.trim() !== '')
  }

  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep)
  const canProceedToAnalysis = getAllFiles().length > 0 && checkTokenRequirement()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">AI Document Wizard</h1>
              {wallet && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="font-medium">{wallet.tokens}</span>
                  <span>credits</span>
                </div>
              )}
              <button
                onClick={() => router.push('/query-history')}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                title="View your query history"
              >
                <ClockIcon className="h-4 w-4" />
                <span>History</span>
              </button>
            </div>
            
            {/* Step Indicator */}
            <StepIndicator
              steps={STEPS}
              currentStep={currentStep}
              onStepClick={navigateToStep}
              canProceed={{
                analysis: canProceedToAnalysis
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            {currentStep === 'documents' && (
              <DocumentStep
                files={serverFiles}
                wallet={wallet}
                onConnectStorage={navigateToCloudStorage}
                onTokenPurchase={() => setShowTokenPurchase(true)}
                onStartAnalysis={() => {
                  if (canProceedToAnalysis) {
                    setCurrentStep('analysis')
                  } else if (!checkTokenRequirement()) {
                    setShowTokenPurchase(true)
                  }
                }}
                onRefreshFiles={fetchServerFiles}
              />
            )}

            {currentStep === 'analysis' && (
              <AnalysisStep
                files={serverFiles}
                grokResult={grokResult}
                wallet={wallet}
                onBackToDocuments={() => setCurrentStep('documents')}
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleAnalysisComplete}
                onNewAnalysis={handleNewAnalysis}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      {paymentSuccess && (
        <NotificationBanner
          type="success"
          title="Payment Successful!"
          message="Your tokens have been added to your account."
          onClose={() => setPaymentSuccess(false)}
        />
      )}

      {error && (
        <NotificationBanner
          type="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  )
}
