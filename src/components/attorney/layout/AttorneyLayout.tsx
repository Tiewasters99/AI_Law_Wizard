"use client";

import { useState, useEffect, useCallback } from "react";
import { AttorneySidebar } from "./AttorneySidebar";
import { AttorneyTopBar } from "./AttorneyTopBar";
import { motion, AnimatePresence } from "framer-motion";

interface AttorneyLayoutProps {
  children: React.ReactNode;
  unreadCount?: number;
}

export function AttorneyLayout({
  children,
  unreadCount = 0,
}: AttorneyLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Check if mobile and load saved sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (!mobile) {
        // Load saved sidebar state for desktop
        const savedState = localStorage.getItem("attorney-sidebar-collapsed");
        if (savedState !== null) {
          setIsCollapsed(savedState === "true");
        }
      } else {
        // On mobile, sidebar is hidden by default
        setShowMobileSidebar(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar);
    } else {
      const newState = !isCollapsed;
      setIsCollapsed(newState);
      localStorage.setItem("attorney-sidebar-collapsed", String(newState));
    }
  }, [isMobile, showMobileSidebar, isCollapsed]);

  const handleCloseMobileSidebar = useCallback(() => {
    if (isMobile) {
      setShowMobileSidebar(false);
    }
  }, [isMobile]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* Top Bar */}
      <AttorneyTopBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <AttorneySidebar
            isCollapsed={isCollapsed}
            onToggle={handleToggleSidebar}
            unreadCount={unreadCount}
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
                    <AttorneySidebar
                      isCollapsed={false}
                      onToggle={handleCloseMobileSidebar}
                      unreadCount={unreadCount}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Mobile Menu Button */}
            {!showMobileSidebar && (
              <button
                onClick={handleToggleSidebar}
                className="fixed bottom-6 left-6 z-30 w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-primary-700 hover:bg-primary-800 transition-colors"
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
            )}
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
