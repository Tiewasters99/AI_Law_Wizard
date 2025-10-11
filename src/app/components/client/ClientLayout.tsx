'use client'

import { useState, useEffect } from 'react'
import { ClientSidebar } from './ClientSidebar'
import { ClientTopBar } from './ClientTopBar'
import { colors } from '@/app/lib/designSystem'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import Link from 'next/link'

interface ClientLayoutProps {
  children: React.ReactNode
  unreadCount?: number
  pendingRequestsCount?: number
}

export function ClientLayout({ children, unreadCount = 0, pendingRequestsCount = 0 }: ClientLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  // Check if mobile and load saved sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      
      if (!mobile) {
        // Load saved sidebar state for desktop
        const savedState = localStorage.getItem('client-sidebar-collapsed')
        if (savedState !== null) {
          setIsCollapsed(savedState === 'true')
        }
      } else {
        // On mobile, sidebar is hidden by default
        setShowMobileSidebar(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleToggleSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar)
    } else {
      const newState = !isCollapsed
      setIsCollapsed(newState)
      localStorage.setItem('client-sidebar-collapsed', String(newState))
    }
  }

  const handleCloseMobileSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(false)
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: colors.background }}>
      {/* Top Bar */}
      <ClientTopBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <ClientSidebar
            isCollapsed={isCollapsed}
            onToggle={handleToggleSidebar}
            unreadCount={unreadCount}
            pendingRequestsCount={pendingRequestsCount}
          />
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && (
          <>
            <AnimatePresence>
              {showMobileSidebar && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/20 z-40"
                    onClick={handleCloseMobileSidebar}
                  />

                  {/* Sidebar */}
                  <motion.div
                    initial={{ x: -280 }}
                    animate={{ x: 0 }}
                    exit={{ x: -280 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="fixed inset-y-0 left-0 z-50 w-72"
                  >
                    <ClientSidebar
                      isCollapsed={false}
                      onToggle={handleCloseMobileSidebar}
                      unreadCount={unreadCount}
                      pendingRequestsCount={pendingRequestsCount}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Mobile Floating Action Button */}
            {!showMobileSidebar && (
              <div className="fixed bottom-6 left-6 z-30 flex flex-col space-y-3">
                {/* Menu Button */}
                <button
                  onClick={handleToggleSidebar}
                  className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
                  style={{
                    backgroundColor: colors.primary[700],
                  }}
                  aria-label="Open menu"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                {/* Quick Action: Find Attorney */}
                <Link
                  href="/directory"
                  className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
                  style={{
                    backgroundColor: colors.success[600],
                  }}
                  aria-label="Find Attorney"
                >
                  <Search className="w-6 h-6 text-white" />
                </Link>
              </div>
            )}
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}

