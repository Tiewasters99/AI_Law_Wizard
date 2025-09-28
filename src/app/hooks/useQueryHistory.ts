import { useState, useEffect, useCallback } from 'react'

export interface DocumentQuery {
  id: string
  userQuery: string
  aiResponse: string
  searchQuery?: string
  success: boolean
  error?: string
  confidence?: number
  processingTime?: number
  totalSteps: number
  completedSteps: number
  toolsUsed: string[]
  filesProcessed?: any
  userId?: string
  sessionId?: string
  createdAt: string
  updatedAt: string
}

// Validation: This interface matches exactly with the API endpoint selection
// All fields are properly typed and match the database schema

export interface QueryHistoryStats {
  total: number
  successful: number
  failed: number
  today: number
  successRate: number
  averageProcessingTime: number
}

export interface QueryHistoryPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface QueryHistoryResponse {
  success: boolean
  data?: {
    queries: DocumentQuery[]
    pagination: QueryHistoryPagination
  }
  error?: string
}

interface RecentQueriesResponse {
  success: boolean
  data?: {
    recentQueries: DocumentQuery[]
    lastQuery?: DocumentQuery
    statistics: QueryHistoryStats
    mostUsedTools: Array<{ tool: string; count: number }>
  }
  error?: string
}

export const useQueryHistory = () => {
  const [queries, setQueries] = useState<DocumentQuery[]>([])
  const [pagination, setPagination] = useState<QueryHistoryPagination | null>(null)
  const [lastQuery, setLastQuery] = useState<DocumentQuery | null>(null)
  const [statistics, setStatistics] = useState<QueryHistoryStats | null>(null)
  const [mostUsedTools, setMostUsedTools] = useState<Array<{ tool: string; count: number }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch query history with pagination and filters
  const fetchQueries = useCallback(async (
    page: number = 1,
    limit: number = 10,
    search: string = '',
    successOnly: boolean = false
  ) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        successOnly: successOnly.toString()
      })

      const response = await fetch(`/api/document-history?${params}`)
      const data: QueryHistoryResponse = await response.json()

      if (data.success && data.data) {
        setQueries(data.data.queries)
        setPagination(data.data.pagination)
      } else {
        setError(data.error || 'Failed to fetch queries')
      }
    } catch (err) {
      setError('Network error while fetching queries')
      console.error('Error fetching queries:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch recent queries and statistics
  const fetchRecentQueries = useCallback(async (limit: number = 5) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/document-history/recent?limit=${limit}`)
      const data: RecentQueriesResponse = await response.json()

      if (data.success && data.data) {
        setQueries(data.data.recentQueries)
        setLastQuery(data.data.lastQuery || null)
        setStatistics(data.data.statistics)
        setMostUsedTools(data.data.mostUsedTools)
      } else {
        setError(data.error || 'Failed to fetch recent queries')
      }
    } catch (err) {
      setError('Network error while fetching recent queries')
      console.error('Error fetching recent queries:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch a single query by ID
  const fetchQuery = useCallback(async (id: string): Promise<DocumentQuery | null> => {
    try {
      const response = await fetch(`/api/document-history/${id}`)
      const data = await response.json()

      if (data.success) {
        return data.data
      } else {
        setError(data.error || 'Failed to fetch query')
        return null
      }
    } catch (err) {
      setError('Network error while fetching query')
      console.error('Error fetching query:', err)
      return null
    }
  }, [])

  // Delete a query
  const deleteQuery = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/document-history/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        // Remove from local state
        setQueries(prev => prev.filter(q => q.id !== id))
        return true
      } else {
        setError(data.error || 'Failed to delete query')
        return false
      }
    } catch (err) {
      setError('Network error while deleting query')
      console.error('Error deleting query:', err)
      return false
    }
  }, [])

  // Clear all queries from local state
  const clearQueries = useCallback(() => {
    setQueries([])
    setPagination(null)
    setLastQuery(null)
    setStatistics(null)
    setMostUsedTools([])
  }, [])

  return {
    queries,
    pagination,
    lastQuery,
    statistics,
    mostUsedTools,
    loading,
    error,
    fetchQueries,
    fetchRecentQueries,
    fetchQuery,
    deleteQuery,
    clearQueries,
    setError
  }
}
