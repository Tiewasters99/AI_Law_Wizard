'use client'


import { Badge } from '@/app/components/ui/badge'
import { 
  Home, 
  MessageCircle,
  Clock,
  WandSparkles,
  Cloud,
  FileText,
  Scale,
  WholeWord,
  EarthIcon,
  User
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/app/components/ui/button'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Wizard', href: '/wizard', icon: WandSparkles },
    { name: 'Integrations', href: '/integrations', icon: Cloud },
    { name: 'Blog', href: '/blog', icon: FileText },
    { name: 'Miniverse™', href: '#', icon: EarthIcon },
  ]
  
  const authenticatedNavigation = [
    { name: 'Profile', href: '/profile', icon: User },
  ]



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Top navigation bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
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
            
            {/* Navigation links */}
            <nav className="flex items-center space-x-1">
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
              {session && authenticatedNavigation.map((item) => {
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
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Badge>
            {session ? (
              <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
            ) : (
              <Button onClick={() => signIn()}>Sign In</Button>
            )}
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="p-4">
        {children}
      </main>
    </div>
  )
}
