'use client'

import { useState } from 'react'
import { Badge } from '@/app/components/ui/badge'
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
  X
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

  // Public navigation items
  const publicNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Apprentice', href: '/apprentice', icon: GraduationCap },
    { name: 'Blog', href: '/blog', icon: FileText },
    { name: 'Miniverse™', href: '/miniverse', icon: EarthIcon },
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
    </div>
  )
}
