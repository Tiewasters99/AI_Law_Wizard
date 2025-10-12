'use client'

import { useState } from 'react'
import { X, Pin, PinOff, ExternalLink, FileText, Calendar, Info } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs'
import { CaseDetailsView } from './CaseDetailsView'
import { DocketDisplay } from './DocketDisplay'
import type { CaseDetails, DocketReportResponse } from '@/types/pacer'

interface ActiveCasePanelProps {
  isOpen: boolean
  onClose: () => void
  caseDetails: CaseDetails | null
  docket: DocketReportResponse | null
  loading: boolean
  onDownloadDocument: (documentId: string) => void
}

export function ActiveCasePanel({
  isOpen,
  onClose,
  caseDetails,
  docket,
  loading,
  onDownloadDocument,
}: ActiveCasePanelProps) {
  const [isPinned, setIsPinned] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'docket'>('details')

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
              {(caseDetails?.caseLink || docket?.caseInfo.caseLink) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    window.open(
                      caseDetails?.caseLink || docket?.caseInfo.caseLink,
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
                    {docket ? (
                      <DocketDisplay docket={docket} onDownloadDocument={onDownloadDocument} />
                    ) : (
                      <div className="text-center text-gray-600 py-8">
                        Click "View Docket" on a search result to load docket entries
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
      </motion.div>
    </AnimatePresence>
  )
}

