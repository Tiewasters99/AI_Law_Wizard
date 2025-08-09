export interface PricingTier {
  id: string
  name: string
  price: number
  currency: string
  period: string
  chatLimit: number
  features: string[]
  popular?: boolean
  description: string
}

export const pricingTiers: PricingTier[] = [
  {
    id: 'silver',
    name: 'Silver',
    price: 9.99,
    currency: 'USD',
    period: 'month',
    chatLimit: 50,
    description: 'Perfect for individual users',
    features: [
      '50 chats per month',
      'Basic legal consultation',
      'Email support',
      'Standard response time',
      'Basic document analysis'
    ]
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 19.99,
    currency: 'USD',
    period: 'month',
    chatLimit: 200,
    description: 'Ideal for small businesses',
    popular: true,
    features: [
      '200 chats per month',
      'Advanced legal consultation',
      'Priority email support',
      'Faster response time',
      'Advanced document analysis',
      'Legal document templates',
      'Case law references'
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 39.99,
    currency: 'USD',
    period: 'month',
    chatLimit: 1000,
    description: 'For law firms and enterprises',
    features: [
      '1000 chats per month',
      'Premium legal consultation',
      '24/7 phone support',
      'Instant response time',
      'Advanced AI analysis',
      'Custom legal documents',
      'Case law database access',
      'Legal research tools',
      'API access',
      'White-label solutions'
    ]
  }
]

export const FREE_CHAT_LIMIT = 2



export function getCurrentUsage(): number {
  // In a real app, this would come from user's session/database
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem('chatCount')
  return stored ? parseInt(stored, 10) : 0
}

export function incrementChatCount(): number {
  if (typeof window === 'undefined') return 0
  const current = getCurrentUsage()
  const newCount = current + 1
  localStorage.setItem('chatCount', newCount.toString())
  return newCount
}



import { isSubscriptionActive } from './subscription'

export function canUserChat(): boolean {
  // If user has active subscription, they can always chat
  if (isSubscriptionActive()) {
    return true
  }
  // Otherwise, check free chat limit
  return getCurrentUsage() < FREE_CHAT_LIMIT
}
