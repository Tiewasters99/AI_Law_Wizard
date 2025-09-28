'use client'

import React, { useState, useEffect } from 'react'
import { DocumentQuery, useQueryHistory } from '../../hooks/useQueryHistory'
import { QueryDetailsModal } from './QueryDetailsModal'
import { format } from '../../utils/dateUtils'
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface QueryHistoryWidgetProps {
  onViewFullHistory?: () => void
  className?: string
}

export const RecentQueriesWidget: React.FC<QueryHistoryWidgetProps> = ({
  onViewFullHistory,
  className = ''
}) => {
  const {
    queries,
    lastQuery,
    loading,
    error,
    fetchRecentQueries
  } = useQueryHistory()

  const [selectedQuery, setSelectedQuery] = useState<DocumentQuery | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchRecentQueries(3) // Show only 3 most recent
  }, [fetchRecentQueries])

  const handleQuerySelect = (query: DocumentQuery) => {
    setSelectedQuery(query)
    setIsModalOpen(true)
  }

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="text-center text-sm text-red-600">Failed to load history</div>
      </div>
    )
  }

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <ClockIcon className="h-4 w-4 mr-2" />
              Recent Queries
            </h3>
            {onViewFullHistory && (
              <button
                onClick={onViewFullHistory}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
              >
                View All
                <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
              </button>
            )}
          </div>
        </div>

        {/* Last Query (if exists) */}
        {lastQuery && (
          <div className="border-b border-gray-100 p-4">
            <div className="text-xs font-medium text-gray-600 mb-2">Last Executed</div>
            <div 
              className="cursor-pointer hover:bg-gray-50 rounded p-2 -m-2"
              onClick={() => handleQuerySelect(lastQuery)}
            >
              <div className="flex items-center mb-1">
                {lastQuery.success ? (
                  <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <XCircleIcon className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className="text-xs text-gray-500">
                  {format(new Date(lastQuery.createdAt), 'MMM dd, HH:mm')}
                </span>
              </div>
              <p className="text-xs text-gray-700 line-clamp-2">
                {truncateText(lastQuery.userQuery)}
              </p>
            </div>
          </div>
        )}

        {/* Recent Queries List */}
        <div className="p-4">
          {queries.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <DocumentTextIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">No recent queries</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queries.slice(0, 3).map((query) => (
                <div
                  key={query.id}
                  className="cursor-pointer hover:bg-gray-50 rounded p-2 -m-2 border border-transparent hover:border-gray-200"
                  onClick={() => handleQuerySelect(query)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      {query.success ? (
                        <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <XCircleIcon className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className="text-xs text-gray-500">
                        {format(new Date(query.createdAt), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <EyeIcon className="h-3 w-3 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-700 line-clamp-2">
                    {truncateText(query.userQuery)}
                  </p>
                  {query.toolsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {query.toolsUsed.slice(0, 2).map((tool, index) => (
                        <span
                          key={index}
                          className="inline-block px-1 py-0.5 rounded text-xs bg-blue-100 text-blue-700"
                        >
                          {tool.replace('_tool', '').replace('_', ' ')}
                        </span>
                      ))}
                      {query.toolsUsed.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{query.toolsUsed.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Query Detail Modal */}
      <QueryDetailsModal
        query={selectedQuery}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedQuery(null)
        }}
      />
    </>
  )
}
