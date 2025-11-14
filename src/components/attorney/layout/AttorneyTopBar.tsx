"use client";

import { useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, Bell } from "lucide-react";

export function AttorneyTopBar() {
  const { data: session } = useSession();

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="h-16 border-b border-border bg-background shadow-sm flex items-center justify-between px-6">
      {/* Logo */}
      <Link
        href="/attorney/dashboard"
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
      <div className="flex items-center space-x-3">
        {/* Attorney Badge */}
        <Badge
          variant="outline"
          className="hidden lg:flex bg-accent/50 text-primary border-primary/20"
        >
          <Shield className="w-3 h-3 mr-1" />
          Attorney Account
        </Badge>

        {/* Notification Bell - TODO: Add notification component */}
        <Button
          variant="outline"
          size="icon"
          className="border-border hover:bg-muted"
        >
          <Bell className="w-5 h-5 text-foreground" />
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

        {/* User Avatar */}
        <div className="flex items-center space-x-2 ml-2">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center border-2 border-border">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={36}
                height={36}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-primary font-semibold text-sm">
                {session?.user?.name?.charAt(0) || "U"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
