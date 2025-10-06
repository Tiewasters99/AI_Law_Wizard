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
  GraduationCap,
  Crown,
  Coins,
  Menu,
  X,
  Lock,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/app/components/ui/button'
import { useAuth } from '@/app/stores/authStore'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { user, isLawyer, isCustomer } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  // Public navigation items (accessible to guests)
  const publicNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Apprentice', href: '/apprentice', icon: GraduationCap },
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
    { name: 'Wizard', href: '/wizard', icon: WandSparkles },
    { name: 'Grand Wizard', href: '/grand-wizard', icon: Crown },
    { name: 'Blog', href: '/blog', icon: FileText },
    { name: 'Tokens', href: '/tokens', icon: Coins },
    { name: 'Miniverse™', href: '/miniverse', icon: EarthIcon },
  ]

  // Customer navigation items (custom order)
  const customerNavigation: Array<{ name: string; href: string; icon: any }> = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Apprentice', href: '/apprentice', icon: GraduationCap },
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
      signIn()
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
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Image 
                src="/images/ai_law_wizard_logo.svg" 
                alt="AI Law Wizard" 
                width={32} 
                height={32}
                className="w-8 h-8 flex-shrink-0"
                priority
              />
              <span className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                AI Law Wizard
              </span>
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
              
              {/* Show locked navigation capsule for guest users */}
              {!session && (
                <button
                  onClick={() => handleLockedNavigationClick('premium-features')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 cursor-pointer group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 hover:border-purple-300/50 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-105"
                  title="Sign in to access premium features"
                >
                  <div className="flex items-center space-x-1">
                    <WandSparkles className="w-4 h-4 text-purple-600" />
                    <Crown className="w-3 h-3 text-purple-500" />
                    <Settings className="w-3 h-3 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 group-hover:text-purple-700">
                    Premium Features
                  </span>
                  <Lock className="w-3 h-3 text-amber-400" />
                  {/* Glassmorphic tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white/90 backdrop-blur-md text-gray-800 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 border border-white/20 shadow-lg">
                    <div className="flex items-center space-x-1">
                      <WandSparkles className="w-3 h-3 text-purple-600" />
                      <Crown className="w-3 h-3 text-purple-500" />
                      <Settings className="w-3 h-3 text-blue-500" />
                      <span>Sign in to access</span>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-white/90"></div>
                  </div>
                </button>
              )}
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
            
            {/* Auth button */}
            {session ? (
              <Button variant="outline" onClick={() => signOut()} className="hidden sm:inline-flex">
                Sign Out
              </Button>
            ) : (
              <Button onClick={() => signIn()} className="hidden sm:inline-flex">
                Sign In
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
              
              {/* Mobile auth buttons */}
              <div className="pt-2 border-t">
                {session ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      signOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full justify-start"
                  >
                    <User className="w-5 h-5 mr-3" />
                    Sign Out
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      signIn()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full justify-start"
                  >
                    <User className="w-5 h-5 mr-3" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Page content */}
      <main className="pt-2 sm:pt-4">
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
