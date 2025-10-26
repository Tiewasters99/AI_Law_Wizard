"use client";

import { useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { colors } from "@/lib/frontend/designSystem";
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
  const { counts, loading } = useNotifications();

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
    <div
      className="h-16 border-b flex items-center justify-between px-6"
      style={{
        backgroundColor: "white",
        borderColor: colors.secondary[200],
        boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      }}
    >
      {/* Logo */}
      <Link
        href="/client/dashboard"
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
            color: "white",
          }}
        >
          <Link
            href="/client/directory"
            className="flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm font-medium">Find Attorney</span>
          </Link>
        </Button>

        {/* Notification Bell */}
        <Button
          variant="outline"
          size="sm"
          className="relative"
          style={{ borderColor: colors.secondary[300] }}
          asChild
        >
          <Link href="/client/inbox">
            <Bell className="w-4 h-4" />
            {counts.total > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
              >
                {counts.total > 9 ? "9+" : counts.total}
              </Badge>
            )}
          </Link>
        </Button>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="hidden sm:flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline text-sm font-medium">Sign Out</span>
        </Button>

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            style={{ borderColor: colors.secondary[300] }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.primary[100] }}
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={32}
                  height={32}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User
                  className="w-4 h-4"
                  style={{ color: colors.primary[700] }}
                />
              )}
            </div>
            <span
              className="hidden md:inline text-sm font-medium"
              style={{ color: colors.text }}
            >
              {session?.user?.name || "My Account"}
            </span>
            <ChevronDown
              className="w-4 h-4"
              style={{ color: colors.secondary[600] }}
            />
          </Button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border z-50"
              style={{ borderColor: colors.secondary[200] }}
            >
              <div
                className="p-3 border-b"
                style={{ borderColor: colors.secondary[200] }}
              >
                <div className="flex flex-col space-y-1">
                  <p
                    className="text-sm font-medium"
                    style={{ color: colors.text }}
                  >
                    {session?.user?.name || "User"}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: colors.secondary[600] }}
                  >
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              <div className="py-1">
                <Link href="/client/profile" className="block">
                  <div className="flex items-center px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </div>
                </Link>
                <Link href="/client/tokens" className="block">
                  <div className="flex items-center px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    My Credits
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
