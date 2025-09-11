'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { File, FileText, Image, Video, X, AlertCircle, FolderOpen, RefreshCw, Database, Brain, ArrowRight, CheckCircle, Play, Cloud, Trash2, Plus, HelpCircle, FileCheck, Zap, Upload, Coins, ShoppingCart, Lock, Shield, LogIn, Sparkles, TrendingUp, Activity, BarChart3, Users } from 'lucide-react'
import { GrokProcessingInterface } from '../components/document-processing/GrokProcessingInterface'
import { TokenPurchase } from '../components/payment/TokenPurchase'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import Layout from '../components/Layout'
import { fetchWallet, consumeTokens, Wallet } from '../lib/stripe'



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

  // Check authentication status and fetch data
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
      // Reload wallet to get updated tokens
      loadWallet()
      // Clean up URL
      window.history.replaceState({}, '', '/wizard')
      // Hide success message after 5 seconds
      setTimeout(() => setPaymentSuccess(false), 5000)
    }
  }, [session, status])

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
      console.error('Error fetching server files:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch files')
    } finally {
      setIsLoadingFiles(false)
    }
  }

  const deleteServerFile = async (fileName: string) => {
    try {
      const response = await fetch(`/api/files?fileName=${encodeURIComponent(fileName)}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete file')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setServerFiles(prev => prev.filter(file => file.fileName !== fileName))
        setSelectedFiles(prev => prev.filter(id => id !== fileName))
      } else {
        throw new Error(data.error || 'Failed to delete file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete file')
    }
  }

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === serverFiles.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(serverFiles.map(f => f.fileName))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return

    try {
      for (const fileName of selectedFiles) {
        await deleteServerFile(fileName)
      }
      setSelectedFiles([])
    } catch (error) {
      console.error('Error deleting selected files:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete selected files')
    }
  }

  const navigateToCloudStorage = () => {
    router.push('/integrations')
  }

  const getFileIcon = (file: ServerFile) => {
    const fileType = getFileTypeFromName(file.fileName)
    
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const getFileTypeFromName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf': return 'application/pdf'
      case 'doc': case 'docx': return 'application/msword'
      case 'txt': return 'text/plain'
      case 'jpg': case 'jpeg': return 'image/jpeg'
      case 'png': return 'image/png'
      case 'gif': return 'image/gif'
      case 'webp': return 'image/webp'
      case 'xls': case 'xlsx': return 'application/vnd.ms-excel'
      case 'csv': return 'text/csv'
      case 'json': return 'application/json'
      default: return 'application/octet-stream'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getAllFiles = () => {
    return serverFiles
  }

  const checkTokenRequirement = () => {
    return wallet && wallet.tokens >= 1 // Require at least 1 token for analysis
  }

  const handleTokenPurchaseSuccess = (tokens: number) => {
    setShowTokenPurchase(false)
    loadWallet() // Refresh wallet data
    setCurrentStep('analyze') // Proceed to analysis step
  }

  const proceedToAnalysis = () => {
    if (!session?.user) {
      router.push('/login')
      return
    }

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
      // Consume 1 token for analysis
      await consumeTokens(1, 'AI Document Analysis')
      await loadWallet() // Refresh wallet
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to consume tokens')
      return false
    }
  }

  const getStepStatus = (step: StepType) => {
    switch (step) {
      case 'files':
        return getAllFiles().length > 0 ? 'completed' : 'current'
      case 'tokens':
        if (!session?.user) return 'pending'
        return checkTokenRequirement() ? 'completed' : currentStep === 'tokens' ? 'current' : 'pending'
      case 'analyze':
        return grokResult ? 'completed' : currentStep === 'analyze' ? 'current' : 'pending'
      default:
        return 'pending'
    }
  }

  const getStepIcon = (step: StepType, status: string) => {
    const baseClasses = "w-6 h-6"
    if (status === 'completed') {
      return <CheckCircle className={`${baseClasses} text-white`} />
    }
    if (status === 'current') {
      if (step === 'files') return <FolderOpen className={`${baseClasses} text-white`} />
      if (step === 'tokens') return <Coins className={`${baseClasses} text-white`} />
      if (step === 'analyze') return <Brain className={`${baseClasses} text-white`} />
      return <Play className={`${baseClasses} text-white`} />
    }
    return <div className={`${baseClasses} rounded-full border-2 border-gray-400 bg-gray-200`} />
  }

  // Authentication Guard with Blur Overlay
  const renderAuthGuard = () => (
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
              onClick={() => signIn()} 
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

  // Enhanced Responsive Token Guard for authenticated users without tokens
  const renderTokenGuard = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full mx-auto px-4 py-8 lg:py-12 xl:px-8 2xl:px-16">
        {/* Hero Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto">
              <Coins className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
              <Lock className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Unlock AI Analysis
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Purchase tokens to access powerful AI document analysis. Each analysis consumes 1 token and provides intelligent insights.
          </p>
        </div>

        {/* Mobile-First Responsive Layout */}
        <div className="space-y-6 lg:space-y-8">
          {/* Current Balance - Mobile First */}
          <div className="w-full max-w-md mx-auto lg:hidden">
            <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0 shadow-2xl">
              <CardContent className="p-6">
                <div className="text-center text-white">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                    <Coins className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{wallet?.tokens || 0}</div>
                  <div className="text-white/90">Analysis Credits Available</div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="text-white/80 text-sm">
                      Need more credits to continue
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Desktop/Tablet Layout */}
          <div className="max-w-8xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 lg:gap-8 xl:gap-12">
              {/* Desktop Sidebar */}
              <div className="hidden xl:block xl:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Balance Card */}
                <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-0 shadow-2xl">
                  <CardContent className="p-6">
                    <div className="text-center text-white">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                        <Coins className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold mb-1">{wallet?.tokens || 0}</div>
                      <div className="text-white/90 text-sm">Credits Available</div>
                      
                      <div className="mt-6 space-y-3">
                        <div className="bg-white/10 rounded-lg p-3">
                          <div className="text-white/90 text-sm font-medium">Today's Usage</div>
                          <div className="text-white/70 text-xs">0 analyses</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3">
                          <div className="text-white/90 text-sm font-medium">Available</div>
                          <div className="text-white/70 text-xs">Unlimited features</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Features Card */}
                <Card className="shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-blue-600" />
                      What You Get
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">Instant Analysis</div>
                        <div className="text-gray-500">AI insights in seconds</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">Secure Processing</div>
                        <div className="text-gray-500">Enterprise-grade security</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Brain className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">Smart Insights</div>
                        <div className="text-gray-500">Advanced AI understanding</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="xl:col-span-4">
              <Card className="shadow-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl md:text-2xl xl:text-3xl font-bold text-gray-900">
                        Choose Your Package
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-2 text-base xl:text-lg">
                        Select the perfect plan for your document analysis needs
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 bg-blue-100 px-4 py-3 rounded-xl">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span className="text-sm xl:text-base font-medium text-blue-800">Secure Payment</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8 xl:p-12">
                  <TokenPurchase 
                    onSuccess={handleTokenPurchaseSuccess}
                    showWallet={false}
                  />
                </CardContent>
              </Card>

              {/* Mobile Features */}
              <div className="xl:hidden mt-6 space-y-4">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 text-center mb-6">
                  Included with Every Package
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 gap-4 lg:gap-6">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Zap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-blue-900">Lightning Fast</div>
                          <div className="text-sm text-blue-700">2.5s average analysis</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-green-900">100% Secure</div>
                          <div className="text-sm text-green-700">Bank-level encryption</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Brain className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-purple-900">AI Powered</div>
                          <div className="text-sm text-purple-700">Advanced intelligence</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium text-orange-900">No Expiry</div>
                          <div className="text-sm text-orange-700">Credits never expire</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Show authentication guard for non-authenticated users
  if (showAuthGuard) {
    return <Layout>{renderAuthGuard()}</Layout>
  }

  // Show token guard for authenticated users without tokens
  if (session?.user && wallet && wallet.tokens < 1 && !showTokenPurchase) {
    return <Layout>{renderTokenGuard()}</Layout>
  }

  // Show token purchase modal
  if (showTokenPurchase) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-x-hidden">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
            <div className="text-center mb-6 sm:mb-8 lg:mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-4 sm:mb-6 shadow-xl">
                <Brain className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-3 sm:mb-4">
                Purchase Tokens
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                Choose your token package to continue with AI document analysis
              </p>
            </div>
            <div className="w-full max-w-4xl mx-auto">
              <Card className="shadow-2xl border-0">
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

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-x-hidden">
        {/* Engaging Header with Stats - Desktop Optimized */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="text-center mb-8 lg:mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-xl">
                <Brain className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                <div className="absolute -top-1 -right-1 w-6 h-6 lg:w-7 lg:h-7 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                </div>
              </div>
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4 lg:mb-6">
                AI Document Wizard
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Transform your documents into actionable insights with cutting-edge AI analysis
              </p>
            </div>

            {/* Stats Bar - Enhanced for Desktop */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8 w-full max-w-6xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row items-center lg:space-x-3 text-center lg:text-left">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2 lg:mb-0">
                    <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg lg:text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-xs lg:text-sm text-gray-600">Accuracy</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row items-center lg:space-x-3 text-center lg:text-left">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center mb-2 lg:mb-0">
                    <Activity className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-lg lg:text-2xl font-bold text-gray-900">2.5s</div>
                    <div className="text-xs lg:text-sm text-gray-600">Avg Time</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row items-center lg:space-x-3 text-center lg:text-left">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-2 lg:mb-0">
                    <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg lg:text-2xl font-bold text-gray-900">50k+</div>
                    <div className="text-xs lg:text-sm text-gray-600">Analyzed</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row items-center lg:space-x-3 text-center lg:text-left">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-2 lg:mb-0">
                    <Users className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-lg lg:text-2xl font-bold text-gray-900">1000+</div>
                    <div className="text-xs lg:text-sm text-gray-600">Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Desktop-Optimized Layout */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 -mt-6 sm:-mt-8 lg:-mt-12 relative z-10">
          {/* Enhanced Mobile Balance Card */}
          {wallet && (
            <div className="lg:hidden mb-6">
              <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <Coins className="w-7 h-7 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-900">{wallet.tokens > 99 ? '99+' : wallet.tokens}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{wallet.tokens}</div>
                        <div className="text-white/80 text-sm">AI Analysis Credits</div>
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-white/70 text-xs">Active</span>
                        </div>
                      </div>
                    </div>
                    {wallet.tokens < 10 && (
                      <Button
                        onClick={() => setShowTokenPurchase(true)}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Top Up
                      </Button>
                    )}
                  </div>
                  
                  {/* Usage Stats */}
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-white/90 text-sm font-medium">Today</div>
                        <div className="text-white/70 text-xs">0 used</div>
                      </div>
                      <div>
                        <div className="text-white/90 text-sm font-medium">This Week</div>
                        <div className="text-white/70 text-xs">0 used</div>
                      </div>
                      <div>
                        <div className="text-white/90 text-sm font-medium">Total</div>
                        <div className="text-white/70 text-xs">0 analyzed</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Desktop Grid Layout - Enhanced for Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            {/* Enhanced Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-1 xl:col-span-1 space-y-4 sm:space-y-6">
              {/* Premium Balance Card */}
              {wallet && (
                <Card className="relative overflow-hidden border-0 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <CardContent className="relative p-6">
                    <div className="text-center mb-4">
                      <div className="relative inline-block">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
                          <Coins className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-900">{wallet.tokens > 99 ? '99+' : wallet.tokens}</span>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">{wallet.tokens}</div>
                      <div className="text-white/80 text-sm">AI Analysis Credits</div>
                      <div className="flex items-center justify-center space-x-1 mt-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white/70 text-xs">Active Subscription</span>
                      </div>
                    </div>

                    {/* Credit Status Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-white/80 text-xs mb-1">
                        <span>Credits Used</span>
                        <span>0/{wallet.tokens}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full" style={{width: '0%'}}></div>
                      </div>
                    </div>

                    {wallet.tokens < 10 && (
                      <Button
                        onClick={() => setShowTokenPurchase(true)}
                        className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Purchase More Credits
                      </Button>
                    )}

                    {/* Usage Analytics */}
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="grid grid-cols-1 gap-3 text-center">
                        <div className="bg-white/10 rounded-lg p-3">
                          <div className="text-white/90 text-sm font-medium">Today's Usage</div>
                          <div className="text-white/70 text-xs">0 analyses</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3">
                          <div className="text-white/90 text-sm font-medium">This Month</div>
                          <div className="text-white/70 text-xs">0 documents processed</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Quick Actions */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-blue-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={navigateToCloudStorage}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start h-12 border-blue-200 hover:border-blue-300 hover:bg-blue-50 group"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                      <Cloud className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Connect Storage</div>
                      <div className="text-xs text-gray-500">Sync your files</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start h-12 border-green-200 hover:border-green-300 hover:bg-green-50 group"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                      <HelpCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Help Center</div>
                      <div className="text-xs text-gray-500">Get support</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start h-12 border-purple-200 hover:border-purple-300 hover:bg-purple-50 group"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                      <BarChart3 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Analytics</div>
                      <div className="text-xs text-gray-500">View insights</div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Main Content Area - Desktop Optimized */}
            <div className="lg:col-span-3 xl:col-span-4 space-y-4 sm:space-y-6 lg:space-y-8">
              {getAllFiles().length === 0 ? (
                <Card className="relative overflow-hidden border-0 shadow-2xl">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
                  
                  <CardContent className="relative p-6 sm:p-8 lg:p-12 xl:p-16">
                    <div className="text-center">
                      {/* Enhanced Icon */}
                      <div className="relative inline-block mb-8 lg:mb-12">
                        <div className="w-24 h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-xl">
                          <FolderOpen className="w-12 h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 text-blue-600" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
                          <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                        </div>
                      </div>

                      {/* Enhanced Content */}
                      <div className="max-w-md sm:max-w-lg lg:max-w-2xl mx-auto mb-6 sm:mb-8 lg:mb-12">
                        <h2 className="text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
                          Ready to Get Started?
                        </h2>
                        <p className="text-gray-600 leading-relaxed text-base sm:text-lg lg:text-xl">
                          Connect your cloud storage to sync documents and unlock the power of AI-driven analysis. 
                          Your documents will be processed instantly and ready for intelligent insights.
                        </p>
                      </div>

                      {/* Enhanced Action Button */}
                      <div className="space-y-4 lg:space-y-6">
                        <Button
                          onClick={navigateToCloudStorage}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto px-8 lg:px-12 py-4 lg:py-6 text-lg lg:text-xl"
                          size="lg"
                        >
                          <Cloud className="w-5 h-5 lg:w-6 lg:h-6 mr-3" />
                          Connect Cloud Storage
                          <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 ml-3" />
                        </Button>
                        
                        <p className="text-sm lg:text-base text-gray-500">
                          Supports OneDrive, Google Drive, Dropbox & more
                        </p>
                      </div>
                    </div>

                    {/* Feature Highlights - Enhanced for Desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-12 lg:mt-16">
                      <div className="text-center p-6 lg:p-8 hover:bg-white/50 rounded-2xl transition-colors">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                          <Zap className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 lg:mb-3 text-lg lg:text-xl">Instant Processing</h3>
                        <p className="text-sm lg:text-base text-gray-600">Documents are analyzed in seconds with advanced AI</p>
                      </div>
                      
                      <div className="text-center p-6 lg:p-8 hover:bg-white/50 rounded-2xl transition-colors">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                          <Shield className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 lg:mb-3 text-lg lg:text-xl">Secure & Private</h3>
                        <p className="text-sm lg:text-base text-gray-600">Your documents are encrypted and never stored</p>
                      </div>
                      
                      <div className="text-center p-6 lg:p-8 hover:bg-white/50 rounded-2xl transition-colors">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                          <Brain className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 lg:mb-3 text-lg lg:text-xl">Smart Insights</h3>
                        <p className="text-sm lg:text-base text-gray-600">Get intelligent summaries and key insights</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Enhanced Documents Summary */}
                  <Card className="relative overflow-hidden border-0 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>
                    <div className="absolute inset-0 bg-black/10"></div>
                    
                    <CardContent className="relative p-8 lg:p-12">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                          {/* Success Indicator */}
                          <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                              <FileCheck className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 lg:w-7 lg:h-7 bg-yellow-400 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 lg:mb-4">
                              {getAllFiles().length} Documents Ready
                            </h2>
                            <p className="text-white/90 text-lg lg:text-xl mb-4">
                              All files processed and optimized for AI analysis
                            </p>
                            <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-300 rounded-full animate-pulse"></div>
                                <span className="text-white/80 text-sm lg:text-base">Ready</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 lg:w-3 lg:h-3 bg-blue-300 rounded-full animate-pulse"></div>
                                <span className="text-white/80 text-sm lg:text-base">Synced</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 lg:w-3 lg:h-3 bg-purple-300 rounded-full animate-pulse"></div>
                                <span className="text-white/80 text-sm lg:text-base">AI Optimized</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 text-center lg:text-right">
                          <Button
                            onClick={proceedToAnalysis}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 w-full lg:w-auto px-8 lg:px-12 py-4 lg:py-6 text-lg lg:text-xl"
                            size="lg"
                          >
                            <Brain className="w-5 h-5 lg:w-6 lg:h-6 mr-3" />
                            Start AI Analysis
                            <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 ml-3" />
                          </Button>
                          <p className="text-white/70 text-sm lg:text-base mt-2">
                            Uses 1 credit per analysis
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mobile Quick Actions - Stacked on Mobile */}
                  <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={navigateToCloudStorage}
                      variant="outline"
                      className="justify-start h-12"
                    >
                      <Cloud className="w-4 h-4 mr-2" />
                      Connect Storage
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-12"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      View Help
                    </Button>
                  </div>

                  {/* Additional Actions - Enhanced for Desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                      <CardContent className="p-4 sm:p-6 lg:p-8">
                        <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Plus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-base sm:text-lg lg:text-xl mb-1">Add Documents</h4>
                            <p className="text-xs sm:text-sm lg:text-base text-gray-500">Connect more storage services</p>
                          </div>
                          <Button
                            onClick={navigateToCloudStorage}
                            variant="outline"
                            size="sm"
                            className="flex-shrink-0 px-3 sm:px-6 lg:px-8 text-xs sm:text-sm"
                          >
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                      <CardContent className="p-4 sm:p-6 lg:p-8">
                        <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-base sm:text-lg lg:text-xl mb-1">View Files</h4>
                            <p className="text-xs sm:text-sm lg:text-base text-gray-500">Browse synced files</p>
                          </div>
                          <Button
                            onClick={navigateToCloudStorage}
                            variant="outline"
                            size="sm"
                            className="flex-shrink-0 px-3 sm:px-6 lg:px-8 text-xs sm:text-sm"
                          >
                            Browse
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Analysis Section - Desktop Optimized */}
        {currentStep === 'analyze' && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
            <div className="mb-6 sm:mb-8 lg:mb-12">
              <h1 className="text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                AI Document Analysis
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">
                Analyzing {getAllFiles().length} documents • Token cost: 1 per analysis
              </p>
            </div>

            {getAllFiles().length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <FolderOpen className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Available</h3>
                  <p className="text-gray-600 mb-4">
                    Connect documents before starting analysis.
                  </p>
                  <Button
                    onClick={() => setCurrentStep('files')}
                    variant="outline"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                    Back to Documents
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6 sm:space-y-8 lg:space-y-12">
                {/* Analysis Tips - Desktop Optimized */}
                <Card className="shadow-xl">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl">Analysis Examples</CardTitle>
                    <CardDescription className="text-sm sm:text-base lg:text-lg">
                      Try asking these types of questions to get the most out of your AI analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                      <div className="p-4 lg:p-6 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-blue-900">Summary</h4>
                        </div>
                        <p className="text-sm lg:text-base text-blue-800">
                          "Summarize the key points from all documents"
                        </p>
                      </div>
                      <div className="p-4 lg:p-6 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-colors">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <h4 className="font-semibold text-green-900">Action Items</h4>
                        </div>
                        <p className="text-sm lg:text-base text-green-800">
                          "Extract action items and deadlines"
                        </p>
                      </div>
                      <div className="p-4 lg:p-6 bg-purple-50 rounded-xl border border-purple-200 hover:bg-purple-100 transition-colors">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Brain className="w-4 h-4 text-purple-600" />
                          </div>
                          <h4 className="font-semibold text-purple-900">Themes</h4>
                        </div>
                        <p className="text-sm lg:text-base text-purple-800">
                          "What are the main themes discussed?"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Interface */}
                <Card className="shadow-xl">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl">Start Analysis</CardTitle>
                    <CardDescription className="text-sm sm:text-base lg:text-lg">
                      Enter your question or request below to begin AI-powered document analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <GrokProcessingInterface
                      onBeforeStart={handleAnalysisStart}
                      onComplete={(result, generatedFile) => {
                        setGrokResult(result)
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Analysis Complete - Desktop Optimized */}
                {grokResult && (
                  <Card className="border-green-200 bg-green-50 shadow-xl">
                    <CardContent className="p-6 lg:p-8">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center space-x-4 lg:space-x-6">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-green-900 text-lg lg:text-2xl mb-1">Analysis Complete</h3>
                            <p className="text-green-700 text-base lg:text-lg">Your AI analysis finished successfully</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                          <Button
                            onClick={() => {
                              setCurrentStep('files')
                              setGrokResult(null)
                            }}
                            variant="outline"
                            size="lg"
                            className="border-green-300 text-green-700 hover:bg-green-100 px-6 lg:px-8"
                          >
                            New Analysis
                          </Button>
                          <Button
                            onClick={() => setCurrentStep('files')}
                            size="lg"
                            className="bg-green-600 hover:bg-green-700 px-6 lg:px-8"
                          >
                            Back to Files
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Payment Success Display */}
        {paymentSuccess && (
          <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-8">
            <Card className="border-green-200 bg-green-50 shadow-xl">
              <CardContent className="p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-green-900 text-lg lg:text-xl mb-2">Payment Successful!</h4>
                    <p className="text-green-800 text-base lg:text-lg">Your tokens have been added to your account. You can now start using AI analysis.</p>
                  </div>
                  <Button
                    onClick={() => setPaymentSuccess(false)}
                    variant="ghost"
                    size="lg"
                    className="text-green-400 hover:text-green-600 flex-shrink-0 px-4 lg:px-6"
                  >
                    <X className="w-5 h-5 lg:w-6 lg:h-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display - Desktop Optimized */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-8">
            <Card className="border-red-200 bg-red-50 shadow-xl">
              <CardContent className="p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 lg:w-8 lg:h-8 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-red-900 text-lg lg:text-xl mb-2">Error Occurred</h4>
                    <p className="text-red-800 text-base lg:text-lg break-words">{error}</p>
                  </div>
                  <Button
                    onClick={() => setError(null)}
                    variant="ghost"
                    size="lg"
                    className="text-red-400 hover:text-red-600 flex-shrink-0 px-4 lg:px-6"
                  >
                    <X className="w-5 h-5 lg:w-6 lg:h-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default WizardPage