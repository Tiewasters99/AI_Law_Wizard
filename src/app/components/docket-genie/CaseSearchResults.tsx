'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { FileText, Eye, Scale, Calendar, User, ExternalLink, Building, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PacerCase } from '@/types/pacer'
import {
  getNatureOfSuitDescription,
  getCaseTypeDescription,
  getBankruptcyChapterDescription,
  formatCaseNumber,
} from '@/app/lib/pacerCodes'

interface CaseSearchResultsProps {
  results: PacerCase[]
  totalCount: number
  estimatedFee: number
  onViewDocket: (caseInfo: { caseNumber: string; court: string }) => void
  onViewDetails: (caseData: PacerCase) => void
  loading?: boolean
}

export function CaseSearchResults({
  results,
  totalCount,
  estimatedFee,
  onViewDocket,
  onViewDetails,
  loading = false,
}: CaseSearchResultsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Searching PACER database...</p>
          <p className="text-sm text-gray-500">This may take a few moments</p>
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Scale className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Cases Found</h3>
            <p className="text-gray-600">
              No cases match your search criteria. Try adjusting your filters or search terms.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sticky Results Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm sticky top-20 z-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" />
              <span className="text-sm font-semibold text-gray-700">Search Results</span>
            </div>
            <div className="h-6 w-px bg-gray-300" />
            <span className="text-sm text-gray-600">
              <strong className="text-gray-900 font-bold">{totalCount}</strong> {totalCount === 1 ? 'case' : 'cases'} found
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">
              Estimated fee: <strong className="text-blue-700 font-bold">${estimatedFee.toFixed(2)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.map((caseItem, index) => (
          <motion.div
            key={`${caseItem.caseNumber}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="space-y-3">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight">
                    {caseItem.caseTitle}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => copyToClipboard(caseItem.caseNumber, caseItem.caseNumber)}
                      className="flex items-center gap-1 text-sm text-blue-700 font-mono font-semibold hover:text-blue-800 transition-colors"
                    >
                      {formatCaseNumber(caseItem.caseNumber)}
                      {copiedId === caseItem.caseNumber ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    {caseItem.caseId && (
                      <span className="text-xs text-gray-500">• ID: {caseItem.caseId}</span>
                    )}
                  </div>
                </div>

                {/* Status Badge - Bold & Prominent */}
                {caseItem.status && (
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                      caseItem.status === 'Open'
                        ? 'bg-green-100 text-green-800 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                    }`}
                  >
                    {caseItem.status}
                  </span>
                )}
              </div>

              {/* Compact Metadata Grid - 4 items per row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {/* Court */}
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Scale className="w-3.5 h-3.5 flex-shrink-0 text-blue-700" />
                  <div className="min-w-0 truncate">
                    <span className="font-semibold">{caseItem.courtName || caseItem.court?.toUpperCase()}</span>
                    {caseItem.caseOffice && (
                      <div className="text-gray-500">Office: {caseItem.caseOffice}</div>
                    )}
                  </div>
                </div>

                {/* Filing Date */}
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-purple-700" />
                  <div>
                    <span className="font-semibold">
                      {new Date(caseItem.filingDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className="text-gray-500">Filed</div>
                  </div>
                </div>

                {/* Judge */}
                {caseItem.judge && (
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <User className="w-3.5 h-3.5 flex-shrink-0 text-amber-700" />
                    <div className="min-w-0">
                      <span className="font-semibold truncate block">{caseItem.judge}</span>
                      <div className="text-gray-500">Judge</div>
                    </div>
                  </div>
                )}

                {/* Case Type */}
                {caseItem.caseType && (
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0 text-indigo-700" />
                    <div>
                      <span className="font-semibold">{getCaseTypeDescription(caseItem.caseType)}</span>
                      <div className="text-gray-500">Type</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Classification Tags - Color Coded */}
              <div className="flex flex-wrap gap-1.5">
                {caseItem.jurisdiction && (
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-md border border-purple-200 font-semibold">
                    {caseItem.jurisdiction}
                  </span>
                )}
                {caseItem.nature && (
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-md border border-amber-200 font-semibold" title={`Code: ${caseItem.nature}`}>
                    {getNatureOfSuitDescription(caseItem.nature)}
                  </span>
                )}
                {caseItem.bankruptcyChapter && (
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-md border border-red-200 font-semibold">
                    {getBankruptcyChapterDescription(caseItem.bankruptcyChapter)}
                  </span>
                )}
                {caseItem.mdlStatus && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md border border-indigo-200 font-semibold">
                    <Building className="w-3 h-3" />
                    MDL: {caseItem.mdlStatus}
                  </span>
                )}
              </div>

              {/* Hover Action Bar */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Button
                  onClick={() => onViewDetails(caseItem)}
                  size="sm"
                  className="flex-1 sm:flex-none bg-blue-700 hover:bg-blue-800 font-semibold"
                >
                  <Eye className="w-4 h-4 mr-1.5" />
                  View Details
                </Button>
                
                {caseItem.caseLink && (
                  <Button
                    onClick={() => window.open(caseItem.caseLink, '_blank')}
                    size="sm"
                    variant="outline"
                    className="flex-1 sm:flex-none font-semibold border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    CM/ECF
                  </Button>
                )}
                
                <Button
                  onClick={() => copyToClipboard(caseItem.caseLink || window.location.href, `link-${caseItem.caseNumber}`)}
                  size="sm"
                  variant="ghost"
                  className="font-semibold"
                >
                  {copiedId === `link-${caseItem.caseNumber}` ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>

              {/* Closed Date if applicable */}
              {caseItem.effectiveDateClosed && (
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  Closed: {new Date(caseItem.effectiveDateClosed).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Results Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center text-sm text-blue-900">
        <p>
          Showing <strong>{results.length}</strong> of <strong>{totalCount}</strong> results • 
          Estimated cost: <strong>${estimatedFee.toFixed(2)}</strong>
        </p>
      </div>
    </div>
  )
}
