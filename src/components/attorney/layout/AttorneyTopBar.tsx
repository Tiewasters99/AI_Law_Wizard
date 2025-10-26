"use client";

import { useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";

export function AttorneyTopBar() {
  const { data: session } = useSession();

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="h-16 border-b border-slate-200 bg-white shadow-sm flex items-center justify-between px-6">
      {/* Logo */}
      <Link
        href="/attorney/dashboard"
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
      <div className="flex items-center space-x-3">
        {/* Attorney Badge */}
        <Badge
          variant="outline"
          className="hidden lg:flex bg-blue-50 text-blue-700 border-blue-200"
        >
          <Shield className="w-3 h-3 mr-1" />
          Attorney Account
        </Badge>

        {/* Notification Bell - TODO: Add notification component */}
        <Button variant="outline" size="icon">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
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

        {/* User Avatar */}
        <div className="flex items-center space-x-2 ml-2">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={36}
                height={36}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-blue-700 font-semibold text-sm">
                {session?.user?.name?.charAt(0) || "U"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
