'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Download, FileText, Calendar, ChevronDown, ChevronUp, DollarSign, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DocketReportResponse, DocketEntry } from '@/types/pacer'

interface DocketDisplayProps {
  docket: DocketReportResponse
  onDownloadDocument: (documentId: string) => void
  loading?: boolean
}

export function DocketDisplay({ docket, onDownloadDocument, loading = false }: DocketDisplayProps) {
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set())
  const [filterText, setFilterText] = useState('')

  const toggleEntry = (entryNumber: number) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(entryNumber)) {
        newSet.delete(entryNumber)
      } else {
        newSet.add(entryNumber)
      }
      return newSet
    })
  }

  // Filter entries based on search text
  const filteredEntries = filterText
    ? docket.docketEntries.filter(
        (entry) =>
          entry.description.toLowerCase().includes(filterText.toLowerCase()) ||
          entry.docketText.toLowerCase().includes(filterText.toLowerCase()) ||
          entry.filedBy?.toLowerCase().includes(filterText.toLowerCase())
      )
    : docket.docketEntries

  return (
    <div className="space-y-3">
      {/* Case Header - Compact */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900">{docket.caseInfo.caseTitle}</h3>
            <p className="text-xs text-blue-700 font-mono mt-0.5">{docket.caseInfo.caseNumber}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Court:</span>{' '}
              <span className="font-semibold text-gray-900">{docket.caseInfo.courtName || docket.caseInfo.court}</span>
            </div>
            {docket.caseInfo.judge && (
              <div>
                <span className="text-gray-500">Judge:</span>{' '}
                <span className="font-semibold text-gray-900">{docket.caseInfo.judge}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Filed:</span>{' '}
              <span className="font-semibold text-gray-900">
                {new Date(docket.caseInfo.filingDate).toLocaleDateString()}
              </span>
            </div>
            {docket.caseInfo.status && (
              <div>
                <span className="text-gray-500">Status:</span>{' '}
                <span className="font-semibold text-gray-900">{docket.caseInfo.status}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-300 text-xs">
            <div className="flex items-center gap-1 text-gray-700">
              <FileText className="w-3 h-3" />
              <span className="font-semibold">{docket.totalEntries} entries</span>
            </div>
            <div className="flex items-center gap-1 text-blue-700">
              <DollarSign className="w-3 h-3" />
              <span className="font-semibold">${docket.estimatedFee.toFixed(2)}</span>
            </div>
          </div>

          {/* Fee Breakdown */}
          {docket.estimatedFee > 0 && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-700 font-medium">PACER Fees:</span>
                <span className="text-blue-800 font-bold">${docket.estimatedFee.toFixed(2)}</span>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Based on {Math.ceil(docket.estimatedFee / 0.10)} pages at $0.10/page
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      {docket.docketEntries.length > 5 && (
        <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg">
          <Filter className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter entries..."
            className="flex-1 text-sm bg-transparent border-none outline-none placeholder-gray-400"
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="text-xs text-blue-700 hover:text-blue-800 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Entries Count */}
      <div className="text-xs text-gray-600 px-1">
        Showing <strong>{filteredEntries.length}</strong> of <strong>{docket.totalEntries}</strong> entries
      </div>

      {/* Docket Entries - Compact */}
      <div className="space-y-2">
        {filteredEntries.map((entry, index) => (
          <motion.div
            key={entry.entryNumber}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.01 }}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
          >
            {/* Entry Header - Compact */}
            <button
              onClick={() => toggleEntry(entry.entryNumber)}
              className="w-full px-3 py-2 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              {/* Entry Number Badge */}
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mt-0.5">
                <span className="text-blue-800 font-bold text-xs">{entry.entryNumber}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight">{entry.description}</h4>
                  {expandedEntries.has(entry.entryNumber) ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{entry.date}</span>
                  </div>
                  {entry.filedBy && (
                    <span className="truncate">By: {entry.filedBy}</span>
                  )}
                  {entry.documents && entry.documents.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">
                      {entry.documents.length} doc{entry.documents.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
              {expandedEntries.has(entry.entryNumber) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-200 bg-gray-50"
                >
                  <div className="px-3 py-3 space-y-3">
                    {/* Docket Text */}
                    <div>
                      <p className="text-xs text-gray-700 leading-relaxed">{entry.docketText}</p>
                    </div>

                    {/* Documents */}
                    {entry.documents && entry.documents.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-900 mb-2">Associated Documents:</p>
                        <div className="space-y-1.5">
                          {entry.documents.map((doc) => (
                            <div
                              key={doc.documentId}
                              className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <FileText className="w-4 h-4 text-blue-700 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-gray-900 truncate">
                                    Document #{doc.documentNumber}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {doc.pages} pages • ${doc.cost?.toFixed(2)}
                                    {doc.cost && doc.cost > 0 && (
                                      <span className="ml-1 text-blue-600 font-medium">
                                        (PACER fee)
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onDownloadDocument(doc.documentId)}
                                disabled={doc.availability !== 'available'}
                                className="flex-shrink-0 h-7 text-xs"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Get
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-600">
            {filterText ? 'No entries match your filter' : 'No docket entries found for this case'}
          </p>
        </div>
      )}
    </div>
  )
}
