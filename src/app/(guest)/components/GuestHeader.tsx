"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { colors } from "@/lib/frontend/designSystem";
import { Menu, X, LogIn, UserPlus } from "lucide-react";

export function GuestHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detect scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigateHome = useCallback(() => router.push("/"), [router]);
  const handleNavigateLegalResearch = useCallback(
    () => router.push("/legal-research"),
    [router]
  );
  const handleNavigateAttorney = useCallback(
    () => router.push("/attorney-features"),
    [router]
  );
  const handleNavigatePricing = useCallback(
    () => router.push("/pricing"),
    [router]
  );
  const handleNavigateMiniverse = useCallback(
    () => router.push("/miniverse"),
    [router]
  );
  const handleNavigateLogin = useCallback(
    () => router.push("/auth/login"),
    [router]
  );
  const handleNavigateRegister = useCallback(
    () => router.push("/auth/register"),
    [router]
  );
  const handleToggleMobileMenu = useCallback(
    () => setIsMobileMenuOpen(prev => !prev),
    []
  );
  const handleCloseMobileMenu = useCallback(
    () => setIsMobileMenuOpen(false),
    []
  );

  const navItems = useMemo(
    () => [
      { label: "Home", action: handleNavigateHome, type: "link" as const },
      {
        label: "For Attorneys",
        action: handleNavigateAttorney,
        type: "link" as const,
      },
      {
        label: "Miniverse™",
        action: handleNavigateMiniverse,
        type: "link" as const,
      },
      {
        label: "Pricing",
        action: handleNavigatePricing,
        type: "link" as const,
      },
    ],
    [
      handleNavigateHome,
      handleNavigateAttorney,
      handleNavigateMiniverse,
      handleNavigatePricing,
    ]
  );

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          backgroundColor: isScrolled
            ? "rgba(255, 255, 255, 0.95)"
            : "transparent",
          backdropFilter: isScrolled ? "blur(12px)" : "none",
          borderBottom: isScrolled
            ? `1px solid ${colors.secondary[200]}`
            : "1px solid transparent",
          boxShadow: isScrolled ? "0 1px 3px 0 rgba(0, 0, 0, 0.1)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/ai_law_wizard_logo_v1.png"
                alt="AI Law Wizard"
                width={1964}
                height={468}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="text-sm font-medium transition-colors hover:text-blue-600"
                  style={{ color: colors.text }}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNavigateLogin}
                style={{ borderColor: colors.secondary[300] }}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={handleNavigateRegister}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={handleToggleMobileMenu}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: colors.text }}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={handleCloseMobileMenu}
            />

            {/* Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 right-0 bottom-0 w-72 z-50 md:hidden"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(20px)",
                boxShadow: "-4px 0 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Close Button */}
              <div
                className="flex items-center justify-between p-6 border-b"
                style={{ borderColor: colors.secondary[200] }}
              >
                <span
                  className="text-lg font-semibold"
                  style={{ color: colors.text }}
                >
                  Menu
                </span>
                <button
                  onClick={handleCloseMobileMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" style={{ color: colors.text }} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-6 space-y-2">
                {navItems.map(item => (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.action();
                      handleCloseMobileMenu();
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg font-medium transition-colors hover:bg-gray-100"
                    style={{ color: colors.text }}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Mobile CTAs */}
              <div
                className="p-6 space-y-3 border-t"
                style={{ borderColor: colors.secondary[200] }}
              >
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => {
                    handleNavigateLogin();
                    handleCloseMobileMenu();
                  }}
                  style={{ borderColor: colors.secondary[300] }}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  className="w-full justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
                  onClick={() => {
                    handleNavigateRegister();
                    handleCloseMobileMenu();
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
