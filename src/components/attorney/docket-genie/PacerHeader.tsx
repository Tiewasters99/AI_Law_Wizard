"use client";

import { useState } from "react";
import {
  FileText,
  Clock,
  LogOut,
  FileStack,
  Search,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

import type { PacerSearchQuery } from "@/types/pacer";

interface PacerHeaderProps {
  isAuthenticated: boolean;
  username: string | null;
  expiresAt: Date | null;
  sessionCost?: number;
  onReconnect: () => void;
  onLogout: () => void;
  onViewDocuments: () => void;
  onQuickSearch?: (query: PacerSearchQuery) => void;
  showMiniSearch?: boolean;
  breadcrumbs?: { label: string; onClick?: () => void }[];
}

export function PacerHeader({
  isAuthenticated,
  username,
  expiresAt,
  sessionCost = 0,
  onReconnect,
  onLogout,
  onViewDocuments,
  onQuickSearch,
  showMiniSearch = false,
  breadcrumbs = [],
}: PacerHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [miniSearchQuery, setMiniSearchQuery] = useState("");
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Calculate time remaining
  useState(() => {
    if (!expiresAt || !isAuthenticated) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Expired");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  });

  const handleMiniSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (miniSearchQuery.trim() && onQuickSearch) {
      // Create a search query object (try to detect if it's a case number or party name)
      const query: PacerSearchQuery = {};
      if (miniSearchQuery.match(/^\d+:\d+-[a-z]+-\d+/i)) {
        query.caseNumber = miniSearchQuery;
      } else {
        query.partyName = miniSearchQuery;
      }
      onQuickSearch(query);
      setMiniSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Branding & Breadcrumbs */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground">
                  Docket Genie
                </h1>
                <p className="text-xs text-muted-foreground">PACER Integration</p>
              </div>
            </div>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && <span className="text-muted-foreground/50">/</span>}
                    {crumb.onClick ? (
                      <button
                        onClick={crumb.onClick}
                        className="hover:text-primary transition-colors"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span className="font-medium text-foreground">
                        {crumb.label}
                      </span>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>

          {/* Center: Mini Search (Desktop) */}
          {showMiniSearch && isAuthenticated && (
            <form
              onSubmit={handleMiniSearch}
              className="hidden lg:flex items-center flex-1 max-w-md mx-4"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={miniSearchQuery}
                  onChange={e => setMiniSearchQuery(e.target.value)}
                  placeholder="Quick search by case # or party..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                />
              </div>
            </form>
          )}

          {/* Right: Session Status & Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                {/* Session Status (Desktop) */}
                <div className="hidden lg:flex items-center gap-3 px-3 py-2 bg-chart-1/10 border border-chart-1/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-1 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-1" />
                    </div>
                    <span className="text-xs font-medium text-chart-1">
                      {username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-chart-1 border-l border-chart-1/30 pl-3">
                    <Clock className="w-3 h-3" />
                    <span className="font-mono">
                      {timeRemaining || "Active"}
                    </span>
                  </div>
                  {sessionCost > 0 && (
                    <div className="text-xs text-chart-1 border-l border-chart-1/30 pl-3">
                      <span className="font-semibold">
                        ${sessionCost.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Documents Button (Desktop) */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewDocuments}
                  className="hidden md:flex items-center gap-2"
                >
                  <FileStack className="w-4 h-4" />
                  <span>Documents</span>
                </Button>

                {/* Logout Button (Desktop) */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border overflow-hidden"
            >
              <div className="py-4 space-y-3">
                {/* Mini Search (Mobile) */}
                {showMiniSearch && isAuthenticated && (
                  <form onSubmit={handleMiniSearch} className="px-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={miniSearchQuery}
                        onChange={e => setMiniSearchQuery(e.target.value)}
                        placeholder="Quick search..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                      />
                    </div>
                  </form>
                )}

                {/* Session Status (Mobile) */}
                {isAuthenticated && (
                  <div className="px-2 py-2 bg-chart-1/10 border border-chart-1/30 rounded-lg mx-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-chart-1 rounded-full" />
                        <span className="font-medium text-chart-1">
                          {username}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-chart-1">
                        <span className="font-mono">
                          {timeRemaining || "Active"}
                        </span>
                        {sessionCost > 0 && (
                          <span className="font-semibold">
                            ${sessionCost.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Actions */}
                {isAuthenticated && (
                  <div className="space-y-2 px-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onViewDocuments();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <FileStack className="w-4 h-4 mr-2" />
                      View Documents
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
