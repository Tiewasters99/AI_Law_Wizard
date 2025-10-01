'use client'

import React, { useState, useEffect } from 'react'
import { DocumentQuery, useQueryHistoryStore } from '../../stores/queryHistoryStore'
import { QueryDetailsModal } from './QueryDetailsModal'
import { format, formatDistanceToNow } from '../../utils/dateUtils'
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowPathIcon,
  Bars3BottomLeftIcon
} from '@heroicons/react/24/outline'

interface RecentQueriesDashboardProps {
  onViewAllHistory?: () => void
}

export const QueryAnalyticsDashboard: React.FC<RecentQueriesDashboardProps> = ({
  onViewAllHistory
}) => {
  const {
    queries,
    lastQuery,
    statistics,
    mostUsedTools,
    loading,
    error,
    fetchRecentQueries
  } = useQueryHistoryStore()

  const [selectedQuery, setSelectedQuery] = useState<DocumentQuery | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchRecentQueries(5)
  }, [fetchRecentQueries])

  const handleRefresh = () => {
    fetchRecentQueries(5)
  }

  const handleQuerySelect = (query: DocumentQuery) => {
    setSelectedQuery(query)
    setIsModalOpen(true)
  }

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const formatProcessingTime = (time?: number) => {
    if (!time) return 'N/A'
    if (time < 1000) return `${time}ms`
    return `${(time / 1000).toFixed(2)}s`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading recent queries...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Queries</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.successRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Processing</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatProcessingTime(statistics.averageProcessingTime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.today}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Last Executed Query */}
        {lastQuery && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Last Executed Query</h3>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(lastQuery.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2">
                    {lastQuery.success ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {lastQuery.success ? 'Successful' : 'Failed'}
                    </span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-500">
                      {formatProcessingTime(lastQuery.processingTime)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                      {truncateText(lastQuery.userQuery, 150)}
                    </p>
                  </div>
                  {lastQuery.toolsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {lastQuery.toolsUsed.map((tool, index) => (
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
                <button
                  onClick={() => handleQuerySelect(lastQuery)}
                  className="ml-4 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="View Details"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Queries */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Queries</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleRefresh}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Refresh"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
                {onViewAllHistory && (
                  <button
                    onClick={onViewAllHistory}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Bars3BottomLeftIcon className="h-4 w-4 mr-1" />
                    View All
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="p-4">
            {queries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent queries found</p>
                <p className="text-sm">Start by asking a question about your documents</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queries.map((query, index) => (
                  <div
                    key={query.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleQuerySelect(query)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1">
                          {query.success ? (
                            <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2" />
                          ) : (
                            <XCircleIcon className="h-3 w-3 text-red-500 mr-2" />
                          )}
                          <span className="text-xs text-gray-500">
                            {format(new Date(query.createdAt), 'MMM dd, HH:mm')}
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            {formatProcessingTime(query.processingTime)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {truncateText(query.userQuery, 100)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQuerySelect(query)
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Most Used Tools */}
        {mostUsedTools.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900">Most Used Tools</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {mostUsedTools.map((toolStat, index) => (
                  <div key={toolStat.tool} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {toolStat.tool.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">{toolStat.count} uses</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(toolStat.count / Math.max(...mostUsedTools.map(t => t.count))) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
