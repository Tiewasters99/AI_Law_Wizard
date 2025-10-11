/**
 * Token Tracking Service
 * Tracks token usage in localStorage with permanent limits until sign-up
 */

const TOKEN_LIMITS = {
  anonymous: 1000,
  registered: 5000
} as const

const STORAGE_KEYS = {
  anonymous: 'ai_wizard_anonymous_tokens',
  userPrefix: 'ai_wizard_user_tokens_'
} as const

export class TokenTracker {
  /**
   * Get current token usage for user or anonymous
   */
  static getTokenUsage(userId?: string): number {
    if (typeof window === 'undefined') return 0
    
    try {
      const key = userId 
        ? `${STORAGE_KEYS.userPrefix}${userId}`
        : STORAGE_KEYS.anonymous
      
      const stored = localStorage.getItem(key)
      return stored ? parseInt(stored, 10) : 0
    } catch (error) {
      console.error('Error reading token usage:', error)
      return 0
    }
  }

  /**
   * Add token usage to the counter
   */
  static addTokenUsage(tokens: number, userId?: string): void {
    if (typeof window === 'undefined') return
    
    try {
      const key = userId 
        ? `${STORAGE_KEYS.userPrefix}${userId}`
        : STORAGE_KEYS.anonymous
      
      const current = this.getTokenUsage(userId)
      const updated = current + tokens
      localStorage.setItem(key, updated.toString())
    } catch (error) {
      console.error('Error updating token usage:', error)
    }
  }

  /**
   * Check if user has exceeded their token limit
   */
  static hasExceededLimit(userId?: string): boolean {
    const usage = this.getTokenUsage(userId)
    const limit = userId ? TOKEN_LIMITS.registered : TOKEN_LIMITS.anonymous
    return usage >= limit
  }

  /**
   * Get remaining tokens
   */
  static getRemainingTokens(userId?: string): number {
    const usage = this.getTokenUsage(userId)
    const limit = userId ? TOKEN_LIMITS.registered : TOKEN_LIMITS.anonymous
    return Math.max(0, limit - usage)
  }

  /**
   * Get token limit for user or anonymous
   */
  static getLimit(userId?: string): number {
    return userId ? TOKEN_LIMITS.registered : TOKEN_LIMITS.anonymous
  }

  /**
   * Reset tokens on sign-up (convert anonymous to registered)
   */
  static resetOnSignup(userId: string): void {
    if (typeof window === 'undefined') return
    
    try {
      // Clear anonymous tokens
      localStorage.removeItem(STORAGE_KEYS.anonymous)
      
      // Set user tokens to 0 (they get 5000 fresh tokens)
      const userKey = `${STORAGE_KEYS.userPrefix}${userId}`
      localStorage.setItem(userKey, '0')
    } catch (error) {
      console.error('Error resetting tokens on signup:', error)
    }
  }

  /**
   * Get usage summary
   */
  static getUsageSummary(userId?: string): {
    used: number
    limit: number
    remaining: number
    percentage: number
    isExceeded: boolean
  } {
    const used = this.getTokenUsage(userId)
    const limit = this.getLimit(userId)
    const remaining = this.getRemainingTokens(userId)
    const percentage = (used / limit) * 100
    const isExceeded = this.hasExceededLimit(userId)

    return {
      used,
      limit,
      remaining,
      percentage,
      isExceeded
    }
  }

  /**
   * Clear all token data (for testing/debugging)
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return
    
    try {
      // Clear anonymous tokens
      localStorage.removeItem(STORAGE_KEYS.anonymous)
      
      // Clear all user tokens
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_KEYS.userPrefix)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error clearing token data:', error)
    }
  }
}

export default TokenTracker

