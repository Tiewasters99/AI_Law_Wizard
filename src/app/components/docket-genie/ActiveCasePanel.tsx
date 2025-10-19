'use client'

import { useState, useEffect } from 'react'
import { X, Pin, PinOff, ExternalLink, FileText, Calendar, Info, DollarSign, AlertCircle } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs'
import { CaseDetailsView } from './CaseDetailsView'
import { DocketDisplay } from './DocketDisplay'
import { useDocketFetcher } from '@/app/hooks/useDocketFetcher'
import type { CaseDetails, DocketReportResponse } from '@/types/pacer'

interface ActiveCasePanelProps {
  isOpen: boolean
  onClose: () => void
  caseDetails: CaseDetails | null
  docket: DocketReportResponse | null
  loading: boolean
  onDownloadDocument: (documentId: string) => void
  sessionToken?: string
}

export function ActiveCasePanel({
  isOpen,
  onClose,
  caseDetails,
  docket,
  loading,
  onDownloadDocument,
  sessionToken,
}: ActiveCasePanelProps) {
  const [isPinned, setIsPinned] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'docket'>('details')
  const [showFeeEstimate, setShowFeeEstimate] = useState(false)
  
  // Use docket fetcher hook
  const {
    docketData,
    feeEstimate,
    loading: docketLoading,
    error: docketError,
    estimateFee,
    fetchDocket,
    clearData,
    clearError,
  } = useDocketFetcher()

  // Auto-fetch docket when case details are available and session token is provided
  useEffect(() => {
    if (caseDetails && sessionToken && !docketData && !docketLoading) {
      handleFetchDocket()
    }
  }, [caseDetails, sessionToken])

  const handleFetchDocket = async () => {
    if (!caseDetails || !sessionToken) return
    
    try {
      // First estimate fees
      await estimateFee(sessionToken, caseDetails.caseNumber, caseDetails.court)
      setShowFeeEstimate(true)
    } catch (error) {
      console.error('Failed to estimate fees:', error)
    }
  }

  const handleConfirmFee = async () => {
    if (!caseDetails || !sessionToken) return
    
    try {
      await fetchDocket(sessionToken, caseDetails.caseNumber, caseDetails.court)
      setShowFeeEstimate(false)
    } catch (error) {
      console.error('Failed to fetch docket:', error)
    }
  }

  const handleCancelFee = () => {
    setShowFeeEstimate(false)
    clearData()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={isPinned ? undefined : onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-0 bottom-0 w-full sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[40%] bg-white shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white p-4 flex-shrink-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold mb-1 truncate">
                  {caseDetails?.caseTitle || docket?.caseInfo.caseTitle || 'Case Details'}
                </h2>
                <p className="text-sm text-blue-100 font-mono">
                  {caseDetails?.caseNumber || docket?.caseInfo.caseNumber}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsPinned(!isPinned)}
                  className="text-white hover:bg-white/20"
                  title={isPinned ? 'Unpin panel' : 'Pin panel'}
                >
                  {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {(caseDetails?.status || docket?.caseInfo.status) && (
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    (caseDetails?.status || docket?.caseInfo.status) === 'Open'
                      ? 'bg-green-500/20 text-green-100'
                      : 'bg-gray-500/20 text-gray-100'
                  }`}
                >
                  {caseDetails?.status || docket?.caseInfo.status}
                </span>
              )}
              {caseDetails?.caseLink && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    window.open(
                      caseDetails.caseLink,
                      '_blank'
                    )
                  }
                  className="text-white hover:bg-white/20 ml-auto"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">CM/ECF</span>
                </Button>
              )}
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600">Loading case information...</p>
              </div>
            ) : !caseDetails && !docket ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Case Selected
                  </h3>
                  <p className="text-gray-600">
                    Select a case from search results to view details and docket.
                  </p>
                </div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'details' | 'docket')} className="h-full flex flex-col">
                <div className="border-b border-gray-200 px-4 pt-2 flex-shrink-0 bg-white sticky top-0 z-10">
                  <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="details" className="flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      <span>Details</span>
                    </TabsTrigger>
                    <TabsTrigger value="docket" className="flex items-center gap-2" disabled={!docket}>
                      <FileText className="w-4 h-4" />
                      <span>Docket</span>
                      {!docket && <span className="text-xs">(N/A)</span>}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <TabsContent value="details" className="mt-0 p-4">
                    {caseDetails ? (
                      <CaseDetailsView caseDetails={caseDetails} />
                    ) : (
                      <div className="text-center text-gray-600 py-8">
                        No case details available
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="docket" className="mt-0 p-4">
                    {docketData ? (
                      <DocketDisplay docket={docketData} onDownloadDocument={onDownloadDocument} />
                    ) : docketLoading ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-4">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-600">Loading docket report...</p>
                      </div>
                    ) : docketError ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Docket</h3>
                          <p className="text-gray-600 mb-4">{docketError}</p>
                          <Button onClick={handleFetchDocket} variant="outline">
                            Try Again
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-600 py-8">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="mb-4">No docket data available</p>
                        {sessionToken && (
                          <Button onClick={handleFetchDocket} className="bg-blue-600 hover:bg-blue-700">
                            <FileText className="w-4 h-4 mr-2" />
                            Load Docket Report
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>

          {/* Panel Footer */}
          <div className="border-t border-gray-200 p-3 bg-gray-50 text-xs text-gray-500 text-center flex-shrink-0">
            {isPinned ? (
              <span>📌 Panel is pinned. Click outside won't close it.</span>
            ) : (
              <span>Click outside or press X to close</span>
            )}
          </div>
        </motion.div>

        {/* Fee Estimation Dialog */}
        <AnimatePresence>
          {showFeeEstimate && feeEstimate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">PACER Fee Estimate</h3>
                    <p className="text-sm text-gray-600">Review estimated costs before proceeding</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Case:</span>
                    <span className="font-mono text-sm font-semibold">{feeEstimate.caseNumber}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Court:</span>
                    <span className="text-sm font-semibold">{feeEstimate.court.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Estimated Pages:</span>
                    <span className="text-sm font-semibold">{feeEstimate.breakdown.docketPages}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Estimated Fee:</span>
                      <span className="text-xl font-bold text-blue-600">
                        ${feeEstimate.estimatedFee.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">Important:</p>
                      <p>This is an estimate. Actual fees may vary based on the number of pages in the docket report. You will be charged the actual amount when the report is generated.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleCancelFee}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmFee}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={docketLoading}
                  >
                    {docketLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Proceed (${feeEstimate.estimatedFee.toFixed(2)})
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

