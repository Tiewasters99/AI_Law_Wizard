'use client'

interface FeatureLimits {
  [key: string]: {
    daily: number
    total: number
    lastReset: string
  }
}

interface UsageStats {
  [key: string]: {
    daily: number
    total: number
  }
}

const DEFAULT_LIMITS: FeatureLimits = {
  'legal-wizard': { daily: 3, total: 10, lastReset: new Date().toDateString() },
  'document-analysis': { daily: 2, total: 5, lastReset: new Date().toDateString() },
  'legal-research': { daily: 5, total: 15, lastReset: new Date().toDateString() },
  'chat-consultation': { daily: 10, total: 30, lastReset: new Date().toDateString() },
  'integration-tools': { daily: 1, total: 3, lastReset: new Date().toDateString() }
}

const STORAGE_KEYS = {
  LIMITS: 'ai-wizard-feature-limits',
  USAGE: 'ai-wizard-usage-stats'
}

export class LimitTracker {
  private static instance: LimitTracker
  private limits: FeatureLimits
  private usage: UsageStats

  constructor() {
    this.limits = this.loadLimits()
    this.usage = this.loadUsage()
    this.resetDailyLimits()
  }

  static getInstance(): LimitTracker {
    if (!LimitTracker.instance) {
      LimitTracker.instance = new LimitTracker()
    }
    return LimitTracker.instance
  }

  private loadLimits(): FeatureLimits {
    if (typeof window === 'undefined') return DEFAULT_LIMITS
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LIMITS)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with defaults to ensure all features have limits
        return { ...DEFAULT_LIMITS, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load limits from localStorage:', error)
    }
    return DEFAULT_LIMITS
  }

  private loadUsage(): UsageStats {
    if (typeof window === 'undefined') return {}
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USAGE)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.warn('Failed to load usage from localStorage:', error)
      return {}
    }
  }

  private saveLimits(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEYS.LIMITS, JSON.stringify(this.limits))
    } catch (error) {
      console.warn('Failed to save limits to localStorage:', error)
    }
  }

  private saveUsage(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(this.usage))
    } catch (error) {
      console.warn('Failed to save usage to localStorage:', error)
    }
  }

  private resetDailyLimits(): void {
    const today = new Date().toDateString()
    let needsReset = false

    Object.keys(this.limits).forEach(feature => {
      if (this.limits[feature].lastReset !== today) {
        this.limits[feature].daily = DEFAULT_LIMITS[feature]?.daily || 0
        this.limits[feature].lastReset = today
        needsReset = true
      }
    })

    if (needsReset) {
      this.saveLimits()
    }
  }

  canUseFeature(featureId: string): { canUse: boolean; reason?: string; remaining?: number } {
    const limit = this.limits[featureId]
    const usage = this.usage[featureId] || { daily: 0, total: 0 }

    if (!limit) {
      return { canUse: true }
    }

    // Check daily limit
    if (usage.daily >= limit.daily) {
      return { 
        canUse: false, 
        reason: `Daily limit reached (${limit.daily} uses per day)`,
        remaining: 0
      }
    }

    // Check total limit
    if (usage.total >= limit.total) {
      return { 
        canUse: false, 
        reason: `Total limit reached (${limit.total} total uses)`,
        remaining: 0
      }
    }

    return { 
      canUse: true, 
      remaining: Math.min(limit.daily - usage.daily, limit.total - usage.total)
    }
  }

  useFeature(featureId: string): boolean {
    const canUse = this.canUseFeature(featureId)
    
    if (!canUse.canUse) {
      return false
    }

    // Update usage
    if (!this.usage[featureId]) {
      this.usage[featureId] = { daily: 0, total: 0 }
    }

    this.usage[featureId].daily += 1
    this.usage[featureId].total += 1

    this.saveUsage()
    return true
  }

  getFeatureStats(featureId: string): {
    daily: { used: number; limit: number; remaining: number }
    total: { used: number; limit: number; remaining: number }
  } {
    const limit = this.limits[featureId]
    const usage = this.usage[featureId] || { daily: 0, total: 0 }

    if (!limit) {
      return {
        daily: { used: 0, limit: 0, remaining: 0 },
        total: { used: 0, limit: 0, remaining: 0 }
      }
    }

    return {
      daily: {
        used: usage.daily,
        limit: limit.daily,
        remaining: Math.max(0, limit.daily - usage.daily)
      },
      total: {
        used: usage.total,
        limit: limit.total,
        remaining: Math.max(0, limit.total - usage.total)
      }
    }
  }

  resetAllLimits(): void {
    this.limits = { ...DEFAULT_LIMITS }
    this.usage = {}
    this.saveLimits()
    this.saveUsage()
  }

  // For premium users - remove limits
  removeLimits(featureId?: string): void {
    if (featureId) {
      delete this.limits[featureId]
    } else {
      this.limits = {}
    }
    this.saveLimits()
  }
}

export const limitTracker = LimitTracker.getInstance()
