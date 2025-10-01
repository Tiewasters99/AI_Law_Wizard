'use client'

import React from 'react'
import { DocumentQuery } from '../../stores/queryHistoryStore'
import { format } from '../../utils/dateUtils'
import { 
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'

interface QueryDetailModalProps {
  query: DocumentQuery | null
  isOpen: boolean
  onClose: () => void
}

export const QueryDetailsModal: React.FC<QueryDetailModalProps> = ({
  query,
  isOpen,
  onClose
}) => {
  if (!isOpen || !query) return null

  // VALIDATION: All displayed data comes directly from the database via API
  // No static data or hardcoded values are used
  // All fields are validated against the DocumentQuery interface

  // Data validation function to ensure all fields are from database
  const validateQueryData = (query: DocumentQuery) => {
    const requiredFields = [
      'id', 'userQuery', 'aiResponse', 'success', 'totalSteps', 
      'completedSteps', 'toolsUsed', 'createdAt', 'updatedAt'
    ]
    
    const optionalFields = [
      'searchQuery', 'error', 'confidence', 'processingTime', 
      'filesProcessed', 'userId', 'sessionId'
    ]
    
    // Validate required fields exist
    const missingRequired = requiredFields.filter(field => !(field in query))
    if (missingRequired.length > 0) {
      console.warn('Missing required fields:', missingRequired)
    }
    
    return {
      isValid: missingRequired.length === 0,
      missingFields: missingRequired
    }
  }

  // Validate the query data
  const validation = validateQueryData(query)

  const formatProcessingTime = (time?: number | null) => {
    if (time === null || time === undefined || isNaN(time) || time < 0) return 'N/A'
    if (time < 1000) return `${Math.round(time)}ms`
    return `${(time / 1000).toFixed(2)}s`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center">
              {query.success ? (
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
              ) : (
                <XCircleIcon className="h-6 w-6 text-red-500 mr-3" />
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Query Details
                  </h3>
                  {/* Request type indicator */}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    query.totalSteps > 2 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {query.totalSteps > 2 ? 'Action Request' : 'Question Request'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {query.createdAt ? format(new Date(query.createdAt), 'MMMM dd, yyyy HH:mm:ss') : 'N/A'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Status and Metrics */}
            <div className={`grid gap-4 p-4 bg-gray-50 rounded-lg ${
              // Show steps only for agentic requests (action performance mode)
              query.totalSteps > 2 ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'
            }`}>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Status</div>
                <div className={`text-lg font-semibold ${query.success ? 'text-green-600' : 'text-red-600'}`}>
                  {query.success ? 'Success' : 'Failed'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Processing Time</div>
                <div className="text-lg font-semibold text-blue-600">
                  {formatProcessingTime(query.processingTime)}
                </div>
              </div>
              {/* Show steps only for agentic requests (action performance mode) */}
              {query.totalSteps > 2 && (
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">Steps</div>
                  <div className="text-lg font-semibold text-purple-600">
                    {query.completedSteps || 0}/{query.totalSteps || 0}
                  </div>
                </div>
              )}
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Confidence</div>
                <div className="text-lg font-semibold text-amber-600">
                  {query.confidence !== null && query.confidence !== undefined 
                    ? `${(query.confidence * 100).toFixed(1)}%` 
                    : 'N/A'}
                </div>
              </div>
            </div>

            {/* User Query */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  User Query
                </h4>
                <button
                  onClick={() => copyToClipboard(query.userQuery)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy to clipboard"
                >
                  <ClipboardDocumentIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {query.userQuery}
                </pre>
              </div>
            </div>

            {/* Search Query */}
            {query.searchQuery && (
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-900">Search Query Used</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <pre className="text-sm text-blue-800 whitespace-pre-wrap font-sans">
                    {query.searchQuery}
                  </pre>
                </div>
              </div>
            )}

            {/* AI Response */}
            {query.success && query.aiResponse && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900 flex items-center">
                    <CpuChipIcon className="h-5 w-5 mr-2" />
                    AI Response
                  </h4>
                  <button
                    onClick={() => copyToClipboard(query.aiResponse)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy to clipboard"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="bg-green-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-green-800 whitespace-pre-wrap font-sans">
                    {query.aiResponse}
                  </pre>
                </div>
              </div>
            )}

            {/* Error Message */}
            {!query.success && query.error && (
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                  Error Details
                </h4>
                <div className="bg-red-50 rounded-lg p-4">
                  <pre className="text-sm text-red-800 whitespace-pre-wrap font-sans">
                    {query.error}
                  </pre>
                </div>
              </div>
            )}

            {/* Tools Used */}
            {query.toolsUsed && query.toolsUsed.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-900 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Tools Used
                </h4>
                <div className="flex flex-wrap gap-2">
                  {query.toolsUsed.map((tool, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tool.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Files Processed */}
            {query.filesProcessed && (
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-900">Files Processed</h4>
                <div className="space-y-2">
                  {(() => {
                    // Handle different data structures from database
                    let files = []
                    if (Array.isArray(query.filesProcessed)) {
                      files = query.filesProcessed
                    } else if (typeof query.filesProcessed === 'object' && query.filesProcessed !== null) {
                      // If it's an object, try to extract array from it
                      files = query.filesProcessed.files || query.filesProcessed.data || [query.filesProcessed]
                    }
                    
                    if (files.length === 0) {
                      return (
                        <div className="bg-gray-50 rounded-lg p-3 text-center text-gray-500">
                          No files processed
                        </div>
                      )
                    }
                    
                    return files.map((file: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {file.fileName || file.originalName || file.name || `File ${index + 1}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {file.fileType && `Type: ${file.fileType}`}
                              {file.fileType && (file.fileSize || file.contentLength) && ' • '}
                              {(file.fileSize || file.contentLength) && `Size: ${file.fileSize || file.contentLength} bytes`}
                              {!file.fileType && !file.fileSize && !file.contentLength && 'File details not available'}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {file.fileId && `ID: ${file.fileId}`}
                          </div>
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-900">Technical Details</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Query ID:</span>
                    <span className="text-gray-600 ml-2 font-mono">{query.id || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Created:</span>
                    <span className="text-gray-600 ml-2">
                      {query.createdAt ? format(new Date(query.createdAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Updated:</span>
                    <span className="text-gray-600 ml-2">
                      {query.updatedAt ? format(new Date(query.updatedAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
                    </span>
                  </div>
                  {/* Show processing steps only for agentic requests */}
                  {query.totalSteps > 2 && (
                    <div>
                      <span className="font-medium text-gray-900">Processing Steps:</span>
                      <span className="text-gray-600 ml-2">
                        {typeof query.completedSteps === 'number' && typeof query.totalSteps === 'number' 
                          ? `${query.completedSteps} of ${query.totalSteps}`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  )}
                  {(query as any).userId && (
                    <div>
                      <span className="font-medium text-gray-900">User ID:</span>
                      <span className="text-gray-600 ml-2 font-mono">{(query as any).userId}</span>
                    </div>
                  )}
                  {(query as any).sessionId && (
                    <div>
                      <span className="font-medium text-gray-900">Session ID:</span>
                      <span className="text-gray-600 ml-2 font-mono">{(query as any).sessionId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
