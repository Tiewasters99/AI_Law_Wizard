'use client'

import { useState } from 'react'
import { Badge } from '@/app/components/ui/badge'
import PremiumFeaturesModal from './PremiumFeaturesModal'
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
  LogOut
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/app/components/ui/button'
import { useAuth } from '@/app/stores/authStore'
import { useRouter } from 'next/navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { user, isLawyer, isCustomer } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  // Public navigation items (accessible to guests)
  const publicNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Directory', href: '/directory', icon: Users },
    { name: 'Blog', href: '/blog', icon: FileText },
    { name: 'Miniverse™', href: '/miniverse', icon: EarthIcon },
  ]

  // Locked navigation items for guests (require authentication)
  const lockedNavigation = [
    { name: 'Wizard', href: '/wizard', icon: WandSparkles, locked: true },
    { name: 'Grand Wizard', href: '/grand-wizard', icon: Crown, locked: true },
    { name: 'Integration', href: '/integrations', icon: Settings, locked: true },
  ]

  // Lawyer-only navigation items
  const lawyerNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Directory', href: '/directory', icon: Users },
    { name: 'Wizard', href: '/wizard', icon: WandSparkles },
    { name: 'Grand Wizard', href: '/grand-wizard', icon: Crown },
    { name: 'Blog', href: '/blog', icon: FileText },
    { name: 'Tokens', href: '/tokens', icon: Coins },
    { name: 'Miniverse™', href: '/miniverse', icon: EarthIcon },
  ]

  // Customer navigation items (custom order)
  const customerNavigation: Array<{ name: string; href: string; icon: any }> = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Directory', href: '/directory', icon: Users },
    { name: 'Wizard', href: '/wizard', icon: Wand2 },
    { name: 'Grand Wizard', href: '/grand-wizard', icon: Crown },
    { name: 'Blog', href: '/blog', icon: FileText },
    { name: 'Miniverse™', href: '/miniverse', icon: EarthIcon },
  ]

  // Common authenticated navigation
  const commonAuthenticatedNavigation = [
    { name: 'Profile', href: '/profile', icon: User },
  ]

  // Determine which navigation to show
  const getNavigationItems = () => {
    if (!session) {
      return publicNavigation
    }

    if (isLawyer) {
      return [...lawyerNavigation, ...commonAuthenticatedNavigation]
    }

    if (isCustomer) {
      return [...customerNavigation, ...commonAuthenticatedNavigation]
    }

    return publicNavigation
  }

  const navigation = getNavigationItems()

  // Handle locked navigation clicks
  const handleLockedNavigationClick = (itemName: string) => {
    if (itemName === 'premium-features') {
      setShowPremiumModal(true)
    } else {
      // Navigate to attorney features page using Next.js router
      router.push('/attorney-features')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Top navigation bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - Logo and Desktop Navigation */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Link href="/landing" className="flex items-center hover:opacity-80 transition-opacity">
              <Image 
                src="/images/ai_law_wizard_logo_v1.png" 
                alt="AI Law Wizard" 
                width={1964} 
                height={468}
                className="h-8 sm:h-10 w-auto flex-shrink-0 object-contain"
                priority
                sizes="(max-width: 640px) 128px, 160px"
              />
            </Link>
            
            {/* Desktop Navigation links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
          
          {/* Right side items */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Date badge - hidden on small mobile */}
            <Badge variant="secondary" className="text-xs hidden sm:flex">
              <Clock className="w-3 h-3 mr-1" />
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Badge>
            
            {/* Attorney Features button - only show for guests */}
            {!session && (
              <Link href="/attorney-features">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  <Scale className="w-4 h-4 mr-2" />
                  Attorney
                </Button>
              </Link>
            )}
            
            {/* Sign Out button - only show for authenticated users */}
            {session && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="hidden sm:flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </Button>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-white/95 backdrop-blur-sm">
            <div className="px-4 py-2 space-y-1">
              {/* Navigation links */}
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                )
              })}
              
              {/* Show locked navigation capsule for guest users */}
              {!session && (
                <button
                  onClick={() => {
                    handleLockedNavigationClick('premium-features')
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 hover:border-purple-300/50 hover:shadow-xl hover:shadow-purple-500/20 w-full"
                  title="Sign in to access premium features"
                >
                  <div className="flex items-center space-x-2">
                    <WandSparkles className="w-5 h-5 text-purple-600" />
                    <Crown className="w-4 h-4 text-purple-500" />
                    <Settings className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-medium text-gray-800 group-hover:text-purple-700">
                      Premium Features
                    </span>
                    <div className="text-xs text-gray-600 group-hover:text-purple-600">
                      Wizard • Grand Wizard • Integration
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-amber-500 font-medium">Locked</span>
                  </div>
                </button>
              )}
              
              {/* Attorney Features - Mobile (only for guests) */}
              {!session && (
                <Link 
                  href="/attorney-features"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 w-full mt-4"
                >
                  <Scale className="w-5 h-5" />
                  <span className="text-sm font-medium">Attorney Features</span>
                </Link>
              )}
              
              {/* Sign Out button - Mobile */}
              {session && (
                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/' })
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 w-full mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Page content */}
      <main>
        {children}
      </main>

      {/* Premium Features Modal */}
      <PremiumFeaturesModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
    </div>
  )
}
