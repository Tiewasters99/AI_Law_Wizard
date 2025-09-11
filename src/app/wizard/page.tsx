'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Brain } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import Layout from '../components/Layout'
import { fetchWallet, consumeTokens, Wallet } from '../lib/stripe'
import { TokenPurchase } from '../components/payment/TokenPurchase'

// Import new components
import { AuthGuard } from '../components/wizard/AuthGuard'
import { TokenGuard } from '../components/wizard/TokenGuard'
import { WalletSidebar } from '../components/wizard/WalletSidebar'
import { DocumentSection } from '../components/wizard/DocumentSection'
import { AnalysisSection } from '../components/wizard/AnalysisSection'
import { WizardHeader } from '../components/wizard/WizardHeader'
import { NotificationBanner } from '../components/wizard/NotificationBanner'

interface ServerFile {
  id: string
  fileName: string
  originalName: string
  size: number
  uploadedAt: string
  modifiedAt: string
  path: string
}

type StepType = 'files' | 'tokens' | 'analyze'

const WizardPage = () => {
  // State management
  const [serverFiles, setServerFiles] = useState<ServerFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<StepType>('files')
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [grokResult, setGrokResult] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [isLoadingWallet, setIsLoadingWallet] = useState(false)
  const [showTokenPurchase, setShowTokenPurchase] = useState(false)
  const [showAuthGuard, setShowAuthGuard] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  
  const router = useRouter()
  const { data: session, status } = useSession()

  // Initialize data and check authentication
  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      setShowAuthGuard(true)
      return
    }

    setShowAuthGuard(false)
    fetchServerFiles()
    loadWallet()

    // Check for payment success
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('payment') === 'success') {
      setPaymentSuccess(true)
      loadWallet()
      window.history.replaceState({}, '', '/wizard')
      setTimeout(() => setPaymentSuccess(false), 5000)
    }
  }, [session, status])

  // Data fetching functions
  const loadWallet = async () => {
    try {
      setIsLoadingWallet(true)
      const walletData = await fetchWallet()
      setWallet(walletData)
    } catch (err) {
      console.error('Failed to load wallet:', err)
    } finally {
      setIsLoadingWallet(false)
    }
  }

  const fetchServerFiles = async () => {
    setIsLoadingFiles(true)
    setError(null)
    
    try {
      const response = await fetch('/api/files')
      
      if (!response.ok) {
        throw new Error('Failed to fetch files from server')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setServerFiles(data.files || [])
      } else {
        throw new Error(data.error || 'Failed to fetch files')
      }
    } catch (error) {
      console.error('Error fetching files:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch files')
    } finally {
      setIsLoadingFiles(false)
    }
  }

  // Helper functions
  const getAllFiles = () => {
    return serverFiles.filter(file => file.fileName && file.fileName.trim() !== '')
  }

  const navigateToCloudStorage = () => {
    router.push('/integrations')
  }

  const checkTokenRequirement = () => {
    return wallet && wallet.tokens >= 1
  }

  // Event handlers
  const handleSignIn = () => {
    signIn()
  }

  const handleTokenPurchaseSuccess = (tokens: number) => {
    setShowTokenPurchase(false)
    loadWallet()
    setCurrentStep('analyze')
  }

  const proceedToAnalysis = () => {
    if (!checkTokenRequirement()) {
      setShowTokenPurchase(true)
      return
    }
    setCurrentStep('analyze')
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
    setCurrentStep('files')
    setGrokResult(null)
  }

  const handleBackToFiles = () => {
    setCurrentStep('files')
  }

  const handleErrorClose = () => {
    setError(null)
  }

  const handlePaymentSuccessClose = () => {
    setPaymentSuccess(false)
  }

  // Render guards
  if (showAuthGuard) {
    return <Layout><AuthGuard onSignIn={handleSignIn} /></Layout>
  }

  if (session?.user && wallet && wallet.tokens < 1 && !showTokenPurchase) {
    return <Layout><TokenGuard onTokenPurchaseSuccess={handleTokenPurchaseSuccess} /></Layout>
  }

  if (showTokenPurchase) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
            <div className="text-center mb-6 sm:mb-8 lg:mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-blue-600 rounded-3xl mb-4 sm:mb-6 shadow-lg">
                <Brain className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                Purchase Tokens
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                Choose your token package to continue with AI document analysis
              </p>
            </div>
            <div className="w-full max-w-4xl mx-auto">
              <Card className="shadow-lg">
                <CardContent className="p-6 sm:p-8 lg:p-12">
                  <TokenPurchase 
                    onSuccess={handleTokenPurchaseSuccess}
                    showWallet={true}
                  />
                  <div className="text-center mt-8">
                    <Button
                      onClick={() => setShowTokenPurchase(false)}
                      variant="outline"
                      size="lg"
                      className="px-8 py-3"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Main render
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <WizardHeader />

        {/* Main Content */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <WalletSidebar 
                wallet={wallet}
                onTokenPurchase={() => setShowTokenPurchase(true)}
                onConnectStorage={navigateToCloudStorage}
              />
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {currentStep === 'files' ? (
                <DocumentSection 
                  files={serverFiles}
                  onConnectStorage={navigateToCloudStorage}
                  onStartAnalysis={proceedToAnalysis}
                />
              ) : currentStep === 'analyze' ? (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                      AI Document Analysis
                    </h1>
                    <p className="text-gray-600">
                      Analyzing {getAllFiles().length} documents • Token cost: 1 per analysis
                    </p>
                  </div>
                  <AnalysisSection
                    files={serverFiles}
                    grokResult={grokResult}
                    onBackToFiles={handleBackToFiles}
                    onAnalysisStart={handleAnalysisStart}
                    onAnalysisComplete={handleAnalysisComplete}
                    onNewAnalysis={handleNewAnalysis}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Notifications */}
        {paymentSuccess && (
          <NotificationBanner
            type="success"
            title="Payment Successful!"
            message="Your tokens have been added to your account. You can now start using AI analysis."
            onClose={handlePaymentSuccessClose}
          />
        )}

        {error && (
          <NotificationBanner
            type="error"
            title="Error Occurred"
            message={error}
            onClose={handleErrorClose}
          />
        )}
      </div>
    </Layout>
  )
}

export default WizardPage