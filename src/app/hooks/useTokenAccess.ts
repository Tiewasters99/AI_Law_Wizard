'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { fetchWallet } from '@/app/lib/stripe'

interface TokenAccessState {
  wallet: any | null
  loading: boolean
  hasEnoughTokens: (requiredTokens: number) => boolean
  currentTokens: number
}

export function useTokenAccess() {
  const { data: session } = useSession()
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadWallet = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        const walletData = await fetchWallet()
        setWallet(walletData)
      } catch (error) {
        console.error('Failed to load wallet:', error)
        setWallet(null)
      } finally {
        setLoading(false)
      }
    }

    loadWallet()
  }, [session])

  const hasEnoughTokens = (requiredTokens: number): boolean => {
    return (wallet?.tokens || 0) >= requiredTokens
  }

  const currentTokens = wallet?.tokens || 0

  return {
    wallet,
    loading,
    hasEnoughTokens,
    currentTokens
  }
}

// Token requirements for different features
export const TOKEN_REQUIREMENTS = {
  WIZARD: 5,        // 5 tokens for wizard access
  GRAND_WIZARD: 10, // 10 tokens for grand wizard access
} as const
