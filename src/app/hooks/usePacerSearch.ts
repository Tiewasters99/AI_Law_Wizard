import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { PacerSearchQuery, PacerSearchResults, PacerCase } from '@/types/pacer'

interface UsePacerSearchReturn {
  results: PacerCase[]
  totalCount: number
  page: number
  totalPages: number
  estimatedFee: number
  loading: boolean
  error: string | null
  searchCases: (query: PacerSearchQuery, sessionToken: string) => Promise<void>
  loadMore: () => Promise<void>
  clearResults: () => void
}

/**
 * Custom hook for managing PACER case search
 */
export function usePacerSearch(): UsePacerSearchReturn {
  const [results, setResults] = useState<PacerCase[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [estimatedFee, setEstimatedFee] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastQuery, setLastQuery] = useState<PacerSearchQuery | null>(null)
  const [lastSessionToken, setLastSessionToken] = useState<string | null>(null)

  /**
   * Search for cases
   */
  const searchCases = useCallback(async (
    query: PacerSearchQuery,
    sessionToken: string
  ): Promise<void> => {
    console.log('[usePacerSearch] searchCases called with:', { query, sessionToken: sessionToken.substring(0, 20) + '...' })
    
    setLoading(true)
    setError(null)

    try {
      console.log('[usePacerSearch] Making API call to /api/pacer/search')
      
      const response = await fetch('/api/pacer/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken,
          query: {
            ...query,
            page: 1, // Reset to page 1 for new search
          },
        }),
      })

      console.log('[usePacerSearch] Response status:', response.status)

      const data: PacerSearchResults & { success: boolean; message?: string } = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Search failed')
      }

      // Update state with results
      setResults(data.cases)
      setTotalCount(data.totalCount)
      setPage(data.page)
      setTotalPages(data.totalPages)
      setEstimatedFee(data.estimatedFee || 0)
      setLastQuery(query)
      setLastSessionToken(sessionToken)
      setError(null)

      // Show success message
      if (data.cases.length > 0) {
        toast.success(`Found ${data.totalCount} case${data.totalCount !== 1 ? 's' : ''}`)
      } else {
        toast.info('No cases found matching your search criteria')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed'
      setError(errorMessage)
      setResults([])
      setTotalCount(0)
      setPage(1)
      setTotalPages(0)
      setEstimatedFee(0)
      
      // Show error toast
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Load more results (pagination)
   */
  const loadMore = useCallback(async (): Promise<void> => {
    if (!lastQuery || !lastSessionToken || page >= totalPages) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const nextPage = page + 1
      const response = await fetch('/api/pacer/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken: lastSessionToken,
          query: {
            ...lastQuery,
            page: nextPage,
          },
        }),
      })

      const data: PacerSearchResults & { success: boolean; message?: string } = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load more results')
      }

      // Append new results
      setResults(prev => [...prev, ...data.cases])
      setPage(data.page)
      setEstimatedFee(prev => prev + (data.estimatedFee || 0))
      setError(null)
      
      // Show success message
      toast.success(`Loaded page ${data.page} of ${totalPages}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more results'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [lastQuery, lastSessionToken, page, totalPages])

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setResults([])
    setTotalCount(0)
    setPage(1)
    setTotalPages(0)
    setEstimatedFee(0)
    setError(null)
    setLastQuery(null)
    setLastSessionToken(null)
  }, [])

  return {
    results,
    totalCount,
    page,
    totalPages,
    estimatedFee,
    loading,
    error,
    searchCases,
    loadMore,
    clearResults,
  }
}

