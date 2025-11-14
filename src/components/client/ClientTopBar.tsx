"use client";

import { useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  Search,
  Bell,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";

export function ClientTopBar() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hasViewedMessagesPage, setHasViewedMessagesPage] = useState(false);
  const { counts, loading } = useNotifications();

  // Check if messages page has been viewed
  useEffect(() => {
    if (session?.user?.id) {
      const viewedKey = `messages-page-viewed-${session.user.id}`;
      const checkViewed = () => {
        const viewed = localStorage.getItem(viewedKey) === "true";
        setHasViewedMessagesPage(viewed);
      };

      // Check initially
      checkViewed();

      // Listen for storage changes (when messages page marks itself as viewed)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === viewedKey) {
          checkViewed();
        }
      };

      window.addEventListener("storage", handleStorageChange);

      // Also listen for custom event for same-tab updates
      const handleCustomStorageChange = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail?.key === viewedKey) {
          checkViewed();
        }
      };

      window.addEventListener(
        "localStorageChange",
        handleCustomStorageChange as EventListener
      );

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener(
          "localStorageChange",
          handleCustomStorageChange as EventListener
        );
      };
    }
  }, [session?.user?.id]);

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-16 border-b border-border bg-background shadow-sm flex items-center justify-between px-6">
      {/* Logo */}
      <Link
        href="/client/dashboard"
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

      {/* Right Side Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">


        {/* Notification Bell */}
        <Button
          variant="outline"
          size="sm"
          className="relative border-border hover:bg-muted"
          asChild
        >
          <Link href="/client/inbox">
            <Bell className="w-4 h-4 text-foreground" />
            {counts.messages > 0 && !hasViewedMessagesPage && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
              >
                {counts.messages > 9 ? "9+" : counts.messages}
              </Badge>
            )}
          </Link>
        </Button>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="hidden sm:flex items-center space-x-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline text-sm font-medium">Sign Out</span>
        </Button>

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="outline"
            className="flex items-center space-x-2 border-border hover:bg-muted"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent border border-border">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={32}
                  height={32}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </div>
            <span className="hidden md:inline text-sm font-medium text-foreground">
              {session?.user?.name || "My Account"}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-md shadow-lg z-50">
              <div className="p-3 border-b border-border">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-popover-foreground">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              <div className="py-1">
                <Link href="/client/profile" className="block">
                  <div className="flex items-center px-3 py-2 text-sm hover:bg-accent cursor-pointer transition-colors">
                    <User className="w-4 h-4 mr-2 text-foreground" />
                    <span className="text-foreground">My Profile</span>
                  </div>
                </Link>
                <Link href="/client/tokens" className="block">
                  <div className="flex items-center px-3 py-2 text-sm hover:bg-accent cursor-pointer transition-colors">
                    <Settings className="w-4 h-4 mr-2 text-foreground" />
                    <span className="text-foreground">My Credits</span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
