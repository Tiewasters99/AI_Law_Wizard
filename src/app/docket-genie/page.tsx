'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { usePacerAuth } from '@/app/hooks/usePacerAuth'
import { usePacerSearch } from '@/app/hooks/usePacerSearch'
import { useDocketData } from '@/app/hooks/useDocketData'
import { PacerHeader } from '@/app/components/docket-genie/PacerHeader'
import { DocketDashboard } from '@/app/components/docket-genie/DocketDashboard'
import { PacerAuthForm } from '@/app/components/docket-genie/PacerAuthForm'
import { CaseSearchForm } from '@/app/components/docket-genie/CaseSearchForm'
import { CaseSearchResults } from '@/app/components/docket-genie/CaseSearchResults'
import { ActiveCasePanel } from '@/app/components/docket-genie/ActiveCasePanel'
import { DocumentManager } from '@/app/components/docket-genie/DocumentManager'
import { motion, AnimatePresence } from 'framer-motion'
import type { PacerSearchQuery } from '@/types/pacer'

type ViewType = 'dashboard' | 'search' | 'auth'

interface RecentSearch {
  id: string
  query: PacerSearchQuery
  timestamp: Date
  resultCount: number
}

export default function DocketGeniePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // View state
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showDocumentsDrawer, setShowDocumentsDrawer] = useState(false)
  const [showCasePanel, setShowCasePanel] = useState(false)
  
  // Data state
  const [selectedCase, setSelectedCase] = useState<{ caseNumber: string; court: string } | null>(null)
  const [downloadedDocuments, setDownloadedDocuments] = useState<any[]>([])
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  
  // Stats state
  const [sessionCost, setSessionCost] = useState(0)
  const [searchesCount, setSearchesCount] = useState(0)
  const [casesViewedCount, setCasesViewedCount] = useState(0)

  // Custom hooks
  const pacerAuth = usePacerAuth()
  const pacerSearch = usePacerSearch()
  const docketData = useDocketData()

  // Check authentication and role
  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/login')
      return
    }

    // Check if user is attorney
    const isAttorney = session.user.role === 'ATTORNEY' || session.user.role === 'LAWYER'
    if (!isAttorney) {
      router.push('/')
    }
  }, [session, status, router])

  // Auto-switch to dashboard when authenticated
  useEffect(() => {
    if (pacerAuth.isAuthenticated && currentView === 'auth') {
      setCurrentView('dashboard')
      setShowAuthModal(false)
    }
  }, [pacerAuth.isAuthenticated, currentView])

  // Handlers
  const handleConnect = () => {
    setShowAuthModal(true)
  }

  const handleLogout = async () => {
    await pacerAuth.logout()
    setCurrentView('dashboard')
    setShowCasePanel(false)
    setRecentSearches([])
    setSessionCost(0)
    setSearchesCount(0)
    setCasesViewedCount(0)
    toast.success('Disconnected from PACER')
  }

  const handleSearch = async (query: PacerSearchQuery) => {
    console.log('[DocketGenie] handleSearch called with query:', query)
    
    if (!pacerAuth.sessionToken || !pacerAuth.isAuthenticated) {
      console.error('[DocketGenie] No session token available')
      toast.error('Please connect to PACER first')
      setShowAuthModal(true)
      return
    }

    console.log('[DocketGenie] Calling searchCases...')
    await pacerSearch.searchCases(query, pacerAuth.sessionToken)
    
    // Track search
    setSearchesCount(prev => prev + 1)
    
    // Add to recent searches
    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query,
      timestamp: new Date(),
      resultCount: pacerSearch.totalCount,
    }
    setRecentSearches(prev => [newSearch, ...prev.slice(0, 4)])
    
    // Update session cost (estimate: $0.10 per search)
    setSessionCost(prev => prev + pacerSearch.estimatedFee)
    
    // Switch to search view
    setCurrentView('search')
  }

  const handleQuickSearch = (query: PacerSearchQuery) => {
    setCurrentView('search')
    handleSearch(query)
  }

  const handleRerunSearch = (query: PacerSearchQuery) => {
    handleSearch(query)
  }

  const handleViewDocket = async (caseInfo: { caseNumber: string; court: string }) => {
    if (!pacerAuth.sessionToken) {
      toast.error('Please connect to PACER first')
      return
    }

    // TODO: Implement docket fetching
    toast.info('Docket viewing coming soon. Use "View Details" for now.')
  }

  const handleViewDetails = (caseData: any) => {
    // Don't make another API call! We already have all the data from search
    // PCL search returns ALL 43+ fields - just display what we have
    console.log('[DocketGenie] ✅ Displaying case details (no API call, $0 cost)')
    
    setSelectedCase({ caseNumber: caseData.caseNumber, court: caseData.court })
    docketData.setCaseDetailsDirectly(caseData)
    setCasesViewedCount(prev => prev + 1)
    setShowCasePanel(true)
  }

  const handleDownloadDocument = async (documentId: string) => {
    if (!pacerAuth.sessionToken || !selectedCase) {
      return
    }

    try {
      const response = await fetch('/api/pacer/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken: pacerAuth.sessionToken,
          documentId,
          caseNumber: selectedCase.caseNumber,
          court: selectedCase.court,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Add to downloaded documents
        const newDoc = {
          id: `${Date.now()}-${documentId}`,
          documentId,
          fileName: data.fileName,
          caseNumber: selectedCase.caseNumber,
          pages: data.pages,
          cost: data.cost,
          downloadedAt: new Date(),
        }
        
        setDownloadedDocuments(prev => [newDoc, ...prev])
        setSessionCost(prev => prev + data.cost)
        
        toast.success('Document downloaded successfully')
      }
    } catch (error) {
      console.error('Document download error:', error)
      toast.error('Failed to download document')
    }
  }

  const handleDeleteDocument = (documentId: string) => {
    setDownloadedDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

  const handleViewDocuments = () => {
    setShowDocumentsDrawer(true)
  }

  const getBreadcrumbs = () => {
    const crumbs: { label: string; onClick?: () => void }[] = []
    
    if (currentView === 'dashboard') {
      crumbs.push({ label: 'Dashboard' })
    } else if (currentView === 'search') {
      crumbs.push(
        { label: 'Dashboard', onClick: () => setCurrentView('dashboard') },
        { label: 'Search Results' }
      )
    }
    
    return crumbs
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Persistent Header */}
      <PacerHeader
        isAuthenticated={pacerAuth.isAuthenticated}
        username={pacerAuth.userInfo?.username || null}
        expiresAt={pacerAuth.expiresAt}
        sessionCost={sessionCost}
        onReconnect={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onViewDocuments={handleViewDocuments}
        onQuickSearch={(query: PacerSearchQuery) => handleQuickSearch(query)}
        showMiniSearch={currentView === 'search'}
        breadcrumbs={getBreadcrumbs()}
      />

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <AnimatePresence mode="wait">
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DocketDashboard
                isAuthenticated={pacerAuth.isAuthenticated}
                username={pacerAuth.userInfo?.username || null}
                expiresAt={pacerAuth.expiresAt}
                sessionCost={sessionCost}
                searchesCount={searchesCount}
                casesViewedCount={casesViewedCount}
                documentsDownloadedCount={downloadedDocuments.length}
                recentSearches={recentSearches}
                onConnect={handleConnect}
                onQuickSearch={handleQuickSearch}
                onRerunSearch={handleRerunSearch}
              />
            </motion.div>
          )}

          {/* Search View */}
          {currentView === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {!pacerAuth.isAuthenticated ? (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-900">
                    Please connect to PACER first to search for cases.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <CaseSearchForm
                    onSearch={handleSearch}
                    loading={pacerSearch.loading}
                  />

                  {pacerSearch.error && (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-900">
                        {pacerSearch.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {(pacerSearch.results.length > 0 || pacerSearch.loading) && (
                    <CaseSearchResults
                      results={pacerSearch.results}
                      totalCount={pacerSearch.totalCount}
                      estimatedFee={pacerSearch.estimatedFee}
                      onViewDocket={handleViewDocket}
                      onViewDetails={handleViewDetails}
                      loading={pacerSearch.loading}
                    />
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <PacerAuthForm
                onAuthenticate={pacerAuth.login}
                onLogout={pacerAuth.logout}
                isAuthenticated={pacerAuth.isAuthenticated}
                username={pacerAuth.userInfo?.username || null}
                loading={pacerAuth.loading}
                error={pacerAuth.error}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Case Panel */}
      <ActiveCasePanel
        isOpen={showCasePanel}
        onClose={() => setShowCasePanel(false)}
        caseDetails={docketData.caseDetails}
        docket={null}
        loading={docketData.loading}
        onDownloadDocument={handleDownloadDocument}
      />

      {/* Documents Drawer */}
      <AnimatePresence>
        {showDocumentsDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowDocumentsDrawer(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Downloaded Documents</h2>
                <button
                  onClick={() => setShowDocumentsDrawer(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <AlertCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <DocumentManager
                  documents={downloadedDocuments}
                  onDownload={handleDownloadDocument}
                  onDelete={handleDeleteDocument}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
