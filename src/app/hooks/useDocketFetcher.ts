import { useState, useCallback } from 'react'
import type { DocketReportResponse, DocketFeeEstimate } from '@/types/pacer'

interface UseDocketFetcherReturn {
  // State
  docketData: DocketReportResponse | null
  feeEstimate: DocketFeeEstimate | null
  loading: boolean
  error: string | null
  
  // Actions
  estimateFee: (sessionToken: string, caseNumber: string, court: string) => Promise<void>
  fetchDocket: (sessionToken: string, caseNumber: string, court: string) => Promise<void>
  clearData: () => void
  clearError: () => void
}

/**
 * Custom hook for fetching PACER docket reports with fee estimation
 */
export function useDocketFetcher(): UseDocketFetcherReturn {
  const [docketData, setDocketData] = useState<DocketReportResponse | null>(null)
  const [feeEstimate, setFeeEstimate] = useState<DocketFeeEstimate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Estimate docket fees before fetching
   */
  const estimateFee = useCallback(async (
    sessionToken: string,
    caseNumber: string,
    court: string
  ) => {
    try {
      setLoading(true)
      setError(null)
      setFeeEstimate(null)

      const response = await fetch('/api/pacer/docket/estimate-fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken,
          caseNumber,
          court,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to estimate fees')
      }

      if (!data.success) {
        throw new Error(data.message || 'Fee estimation failed')
      }

      setFeeEstimate(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Fee estimation error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Fetch full docket report
   */
  const fetchDocket = useCallback(async (
    sessionToken: string,
    caseNumber: string,
    court: string
  ) => {
    try {
      setLoading(true)
      setError(null)
      setDocketData(null)

      const response = await fetch('/api/pacer/docket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken,
          caseNumber,
          court,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch docket')
      }

      if (!data.success) {
        throw new Error(data.message || 'Docket fetch failed')
      }

      setDocketData(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Docket fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Clear all data
   */
  const clearData = useCallback(() => {
    setDocketData(null)
    setFeeEstimate(null)
    setError(null)
  }, [])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    docketData,
    feeEstimate,
    loading,
    error,
    
    // Actions
    estimateFee,
    fetchDocket,
    clearData,
    clearError,
  }
}
