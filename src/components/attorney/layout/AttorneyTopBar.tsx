"use client";

import { useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";

export function AttorneyTopBar() {
  const { data: session } = useSession();
  const { counts, refetch } = useNotifications();

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

        {/* Notifications Dropdown - fetch on open, no polling */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative border-border hover:bg-muted"
              onClick={() => {
                // Trigger refresh when attempting to open
                window.dispatchEvent(new Event("notifications:open"));
                refetch();
              }}
            >
              <Bell className="w-5 h-5 text-foreground" />
              {counts.total > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {counts.total > 9 ? "9+" : counts.total}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="w-full flex items-center justify-between">
                <span className="text-foreground">All Unread</span>
                <Badge variant="secondary" className="ml-2">
                  {counts.total}
                </Badge>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="w-full flex items-center justify-between">
                <span className="text-foreground">Messages</span>
                <Badge variant="secondary" className="ml-2">
                  {counts.messages}
                </Badge>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="w-full flex items-center justify-between">
                <span className="text-foreground">Notifications</span>
                <Badge variant="secondary" className="ml-2">
                  {counts.notifications}
                </Badge>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="w-full flex items-center justify-between">
                <span className="text-foreground">Pending Requests</span>
                <Badge variant="secondary" className="ml-2">
                  {counts.pendingRequests}
                </Badge>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
