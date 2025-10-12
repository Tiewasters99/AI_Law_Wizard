'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { FileText, Download, Trash2, Brain, DollarSign, MoreVertical, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface DownloadedDocument {
  id: string
  documentId: string
  fileName: string
  caseNumber: string
  description?: string
  pages: number
  cost: number
  downloadedAt: Date
}

interface DocumentManagerProps {
  documents: DownloadedDocument[]
  onDownload: (documentId: string) => void
  onDelete: (documentId: string) => void
}

export function DocumentManager({
  documents,
  onDownload,
  onDelete,
}: DocumentManagerProps) {
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set())
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const router = useRouter()

  const toggleSelect = (docId: string) => {
    setSelectedDocs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(docId)) {
        newSet.delete(docId)
      } else {
        newSet.add(docId)
      }
      return newSet
    })
  }

  const selectAll = () => {
    if (selectedDocs.size === documents.length) {
      setSelectedDocs(new Set())
    } else {
      setSelectedDocs(new Set(documents.map(d => d.id)))
    }
  }

  const deleteSelected = () => {
    if (confirm(`Delete ${selectedDocs.size} selected documents?`)) {
      selectedDocs.forEach(docId => onDelete(docId))
      setSelectedDocs(new Set())
    }
  }

  const analyzeDocument = (doc: DownloadedDocument) => {
    // Navigate to Document Analysis with pre-loaded document
    router.push(`/wizard?document=${encodeURIComponent(doc.fileName)}`)
  }

  const totalCost = documents.reduce((sum, doc) => sum + doc.cost, 0)

  if (documents.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No Documents Downloaded
            </h3>
            <p className="text-sm text-gray-600">
              Download documents from docket entries to view and analyze them here.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedDocs.size === documents.length}
            onChange={selectAll}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            {selectedDocs.size > 0 ? `${selectedDocs.size} selected` : 'Select all'}
          </span>
          
          {selectedDocs.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteSelected}
              className="ml-2"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-gray-600" />
          <span className="text-gray-600">Total: <strong className="text-gray-900">${totalCost.toFixed(2)}</strong></span>
        </div>
      </div>

      {/* Compact Documents List */}
      <div className="space-y-2">
        <AnimatePresence>
          {documents.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.02 }}
              className={`relative bg-white border rounded-lg p-3 transition-colors ${
                selectedDocs.has(doc.id)
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedDocs.has(doc.id)}
                  onChange={() => toggleSelect(doc.id)}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />

                {/* Icon */}
                <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-700" />
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{doc.fileName}</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Case: {doc.caseNumber}
                  </p>
                  {doc.description && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.description}</p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs text-gray-600 mt-1.5">
                    <span>{doc.pages} pages</span>
                    <span>•</span>
                    <span className="font-semibold text-blue-700">${doc.cost.toFixed(2)}</span>
                    <span>•</span>
                    <span>{new Date(doc.downloadedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions Menu */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>

                  {openMenuId === doc.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1"
                    >
                      <button
                        onClick={() => {
                          analyzeDocument(doc)
                          setOpenMenuId(null)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <Brain className="w-4 h-4" />
                        Analyze with AI
                      </button>
                      <button
                        onClick={() => {
                          onDownload(doc.documentId)
                          setOpenMenuId(null)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download Again
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this document?')) {
                            onDelete(doc.id)
                          }
                          setOpenMenuId(null)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
        <p className="text-sm text-blue-900">
          <strong>{documents.length}</strong> documents downloaded • 
          Total cost: <strong>${totalCost.toFixed(2)}</strong>
        </p>
      </div>
    </div>
  )
}
