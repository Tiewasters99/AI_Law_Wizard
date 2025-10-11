'use client'

import { useState, useCallback, useMemo } from 'react'
import { Badge } from '@/app/components/ui/badge'
import PremiumFeaturesModal from './PremiumFeaturesModal'
import { NotificationBell } from './consultation/NotificationBell'
import { AttorneyLayout } from './attorney/AttorneyLayout'
import { ClientLayout } from './client/ClientLayout'
import { GuestHeader } from './guest/GuestHeader'
import {
  Home,
  Clock,
  WandSparkles,
  Wand2,
  Cloud,
  FileText,
  WholeWord,
  EarthIcon,
  User,
  Users,
  GraduationCap,
  Crown,
  Coins,
  Menu,
  X,
  Lock,
  Settings,
  Scale,
  LogOut,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/app/components/ui/button'
import { useAuth } from '@/app/stores/authStore'
import { useRouter } from 'next/navigation'

// Navigation arrays - moved outside component for performance
const PUBLIC_NAVIGATION = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Directory', href: '/directory', icon: Users },
  { name: 'Blog', href: '/blog', icon: FileText },
  { name: 'Miniverse™', href: '/miniverse', icon: EarthIcon },
]

const LOCKED_NAVIGATION = [
  { name: 'Wizard', href: '/wizard', icon: WandSparkles, locked: true },
  { name: 'Grand Wizard', href: '/grand-wizard', icon: Crown, locked: true },
  { name: 'Integration', href: '/integrations', icon: Settings, locked: true },
]

const LAWYER_NAVIGATION = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Directory', href: '/directory', icon: Users },
  { name: 'Inbox', href: '/inbox', icon: MessageSquare },
  { name: 'Wizard', href: '/wizard', icon: WandSparkles },
  { name: 'Grand Wizard', href: '/grand-wizard', icon: Crown },
  { name: 'Blog', href: '/blog', icon: FileText },
  { name: 'Tokens', href: '/tokens', icon: Coins },
  { name: 'Miniverse™', href: '/miniverse', icon: EarthIcon },
]

const CUSTOMER_NAVIGATION = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Directory', href: '/directory', icon: Users },
  { name: 'Inbox', href: '/inbox', icon: MessageSquare },
  { name: 'Wizard', href: '/wizard', icon: Wand2 },
  { name: 'Grand Wizard', href: '/grand-wizard', icon: Crown },
  { name: 'Blog', href: '/blog', icon: FileText },
  { name: 'Miniverse™', href: '/miniverse', icon: EarthIcon },
]

const COMMON_AUTHENTICATED_NAVIGATION = [
  { name: 'Profile', href: '/profile', icon: User },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { user, isLawyer, isCustomer } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  // Memoized navigation based on user role
  const navigation = useMemo(() => {
    if (!session) {
      return PUBLIC_NAVIGATION
    }

    if (isLawyer) {
      return [...LAWYER_NAVIGATION, ...COMMON_AUTHENTICATED_NAVIGATION]
    }

    if (isCustomer) {
      return [...CUSTOMER_NAVIGATION, ...COMMON_AUTHENTICATED_NAVIGATION]
    }

    return PUBLIC_NAVIGATION
  }, [session, isLawyer, isCustomer])

  // Handle locked navigation clicks
  const handleLockedNavigationClick = useCallback((itemName: string) => {
    if (itemName === 'premium-features') {
      setShowPremiumModal(true)
    } else {
      // Navigate to attorney features page using Next.js router
      router.push('/attorney-features')
    }
  }, [router])

  // Use AttorneyLayout for authenticated attorneys
  if (session && isLawyer) {
    return <AttorneyLayout>{children}</AttorneyLayout>
  }

  // Use ClientLayout for authenticated clients
  if (session && isCustomer) {
    return <ClientLayout>{children}</ClientLayout>
  }

  // Guest users get clean header with minimal navigation
  return (
    <>
      <GuestHeader />
      <main className="pt-16">
        {children}
      </main>
    </>
  )
}
