'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { colors } from '@/app/lib/designSystem'
import { NotificationBell } from '@/app/components/consultation/NotificationBell'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import {
  LogOut,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  Search,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/app/components/ui/dropdown-menu'

export function ClientTopBar() {
  const { data: session } = useSession()

  return (
    <div
      className="h-16 border-b flex items-center justify-between px-6"
      style={{
        backgroundColor: 'white',
        borderColor: colors.secondary[200],
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
        <Image 
          src="/images/ai_law_wizard_logo_v1.png" 
          alt="AI Law Wizard" 
          width={1964} 
          height={468}
          className="h-10 w-auto object-contain"
          priority
        />
      </Link>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Help Center Button */}
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex items-center space-x-2"
          style={{
            borderColor: colors.success[300],
            color: colors.success[700],
            backgroundColor: colors.success[50],
          }}
        >
          <HelpCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Help Center</span>
        </Button>

        {/* Quick Action - Find Attorney */}
        <Button
          asChild
          size="sm"
          className="hidden lg:flex"
          style={{
            backgroundColor: colors.primary[700],
            color: 'white',
          }}
        >
          <Link href="/directory" className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span className="text-sm font-medium">Find Attorney</span>
          </Link>
        </Button>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Sign Out Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="hidden sm:flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline text-sm font-medium">Sign Out</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu
          trigger={
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              style={{ borderColor: colors.secondary[300] }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.primary[100] }}
              >
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4" style={{ color: colors.primary[700] }} />
                )}
              </div>
              <span className="hidden md:inline text-sm font-medium" style={{ color: colors.text }}>
                {session?.user?.name || 'My Account'}
              </span>
              <ChevronDown className="w-4 h-4" style={{ color: colors.secondary[600] }} />
            </Button>
          }
          align="end"
          className="w-56"
        >
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium" style={{ color: colors.text }}>
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs" style={{ color: colors.secondary[600] }}>
                {session?.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/profile" className="block">
            <DropdownMenuItem className="flex items-center cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              My Profile
            </DropdownMenuItem>
          </Link>
          <Link href="/tokens" className="block">
            <DropdownMenuItem className="flex items-center cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              My Credits
            </DropdownMenuItem>
          </Link>
        </DropdownMenu>
      </div>
    </div>
  )
}

