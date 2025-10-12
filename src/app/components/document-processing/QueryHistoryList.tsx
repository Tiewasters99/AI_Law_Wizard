'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { DocumentQuery, useQueryHistoryStore } from '../../stores/queryHistoryStore'
import { format } from '../../utils/dateUtils'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface QueryHistoryProps {
  onSelectQuery?: (query: DocumentQuery) => void
  showStats?: boolean
}

// Move helper functions outside component to prevent re-creation
const formatProcessingTime = (time?: number) => {
  if (!time) return 'N/A'
  if (time < 1000) return `${time}ms`
  return `${(time / 1000).toFixed(2)}s`
}

const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const QueryHistoryList: React.FC<QueryHistoryProps> = ({ 
  onSelectQuery, 
  showStats = true 
}) => {
  const {
    queries,
    pagination,
    statistics,
    mostUsedTools,
    loading,
    error,
    fetchQueries,
    fetchRecentQueries,
    deleteQuery
  } = useQueryHistoryStore()

  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuccessOnly, setShowSuccessOnly] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState<DocumentQuery | null>(null)

  // Fetch queries on component mount and when filters change
  useEffect(() => {
    if (showStats) {
      fetchRecentQueries(10)
    } else {
      fetchQueries(currentPage, 10, searchTerm, showSuccessOnly)
    }
  }, [currentPage, searchTerm, showSuccessOnly, showStats, fetchQueries, fetchRecentQueries])

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  const handleDelete = useCallback(async (queryId: string) => {
    if (window.confirm('Are you sure you want to delete this query?')) {
      const success = await deleteQuery(queryId)
      if (success) {
        // Refresh the current page
        if (showStats) {
          fetchRecentQueries(10)
        } else {
          fetchQueries(currentPage, 10, searchTerm, showSuccessOnly)
        }
      }
    }
  }, [deleteQuery, showStats, fetchRecentQueries, fetchQueries, currentPage, searchTerm, showSuccessOnly])

  const handleQuerySelect = useCallback((query: DocumentQuery) => {
    setSelectedQuery(query)
    onSelectQuery?.(query)
  }, [onSelectQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading query history...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Query History
          </h2>
          {!showStats && (
            <div className="text-sm text-gray-500">
              {pagination?.total || 0} total queries
            </div>
          )}
        </div>

        {/* Search and Filters */}
        {!showStats && (
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showSuccessOnly}
                onChange={(e) => setShowSuccessOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Successful only</span>
            </label>
          </div>
        )}
      </div>

      {/* Statistics Panel */}
      {showStats && statistics && (
        <div className="border-b border-gray-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
              <div className="text-sm text-gray-600">Total Queries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.successful}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{statistics.today}</div>
              <div className="text-sm text-gray-600">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{statistics.successRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Query List */}
      <div className="p-4">
        {queries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No queries found</p>
            {searchTerm && <p className="text-sm">Try adjusting your search terms</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {queries.map((query) => (
              <div
                key={query.id}
                className={`border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedQuery?.id === query.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleQuerySelect(query)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Query Status and Time */}
                    <div className="flex items-center mb-2">
                      {query.success ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <span className="text-xs text-gray-500 flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {format(new Date(query.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                      {query.processingTime && (
                        <span className="ml-4 text-xs text-gray-500">
                          {formatProcessingTime(query.processingTime)}
                        </span>
                      )}
                    </div>

                    {/* User Query */}
                    <div className="mb-2">
                      <div className="text-sm font-medium text-gray-900 mb-1">Query:</div>
                      <div className="text-sm text-gray-700 bg-gray-100 rounded p-2">
                        {truncateText(query.userQuery)}
                      </div>
                    </div>

                    {/* AI Response */}
                    {query.success && query.aiResponse && (
                      <div className="mb-2">
                        <div className="text-sm font-medium text-gray-900 mb-1">Response:</div>
                        <div className="text-sm text-gray-700 bg-blue-50 rounded p-2">
                          {truncateText(query.aiResponse, 150)}
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {!query.success && query.error && (
                      <div className="mb-2">
                        <div className="text-sm font-medium text-red-900 mb-1">Error:</div>
                        <div className="text-sm text-red-700 bg-red-50 rounded p-2">
                          {truncateText(query.error)}
                        </div>
                      </div>
                    )}

                    {/* Tools Used */}
                    {query.toolsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {query.toolsUsed.map((tool, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tool.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuerySelect(query)
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(query.id)
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Query"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!showStats && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages} 
              ({pagination.total} total)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
