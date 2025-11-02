"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
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
  const handleNavigateClient = useCallback(
    () => router.push("/client-features"),
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
        label: "For Clients",
        action: handleNavigateClient,
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
      handleNavigateClient,
      handleNavigateMiniverse,
      handleNavigatePricing,
    ]
  );

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/ai_law_wizard_logo_v1.svg"
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
                  className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={handleNavigateLogin}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={handleNavigateRegister}
                className="shadow-md transition-all"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={handleToggleMobileMenu}
              className="md:hidden p-2 rounded-lg transition-colors text-foreground"
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
              className="fixed top-0 right-0 bottom-0 w-72 z-50 md:hidden bg-background/98 backdrop-blur-xl shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]"
            >
              {/* Close Button */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <span className="text-lg font-semibold text-foreground">
                  Menu
                </span>
                <button
                  onClick={handleCloseMobileMenu}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
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
                    className="w-full text-left px-4 py-3 rounded-lg font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Mobile CTAs */}
              <div className="p-6 space-y-3 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => {
                    handleNavigateLogin();
                    handleCloseMobileMenu();
                  }}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  className="w-full justify-center shadow-md transition-all"
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
