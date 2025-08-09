export interface UserSubscription {
  tier: 'silver' | 'gold' | 'platinum' | null
  purchasedAt: Date | null
  expiresAt: Date | null
  isActive: boolean
}

export function getUserSubscription(): UserSubscription {
  if (typeof window === 'undefined') {
    return {
      tier: null,
      purchasedAt: null,
      expiresAt: null,
      isActive: false
    }
  }

  const stored = localStorage.getItem('userSubscription')
  if (!stored) {
    return {
      tier: null,
      purchasedAt: null,
      expiresAt: null,
      isActive: false
    }
  }

  try {
    const subscription = JSON.parse(stored)
    return {
      ...subscription,
      purchasedAt: subscription.purchasedAt ? new Date(subscription.purchasedAt) : null,
      expiresAt: subscription.expiresAt ? new Date(subscription.expiresAt) : null
    }
  } catch {
    return {
      tier: null,
      purchasedAt: null,
      expiresAt: null,
      isActive: false
    }
  }
}

export function setUserSubscription(tier: 'silver' | 'gold' | 'platinum'): void {
  if (typeof window === 'undefined') return

  const now = new Date()
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

  const subscription: UserSubscription = {
    tier,
    purchasedAt: now,
    expiresAt,
    isActive: true
  }

  localStorage.setItem('userSubscription', JSON.stringify(subscription))
}

export function clearUserSubscription(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('userSubscription')
}

export function isSubscriptionActive(): boolean {
  const subscription = getUserSubscription()
  if (!subscription.isActive || !subscription.expiresAt) return false
  
  return new Date() < subscription.expiresAt
}

export function getSubscriptionTier(): 'silver' | 'gold' | 'platinum' | null {
  const subscription = getUserSubscription()
  return isSubscriptionActive() ? subscription.tier : null
}
