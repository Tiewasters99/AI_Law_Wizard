"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, LogOut, Settings, Shield, User } from "lucide-react";

interface AdminTopBarProps {
  admin: {
    adminId?: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  };
}

export function AdminTopBar({ admin }: AdminTopBarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  const handleSettingsClick = () => {
    router.push("/admin/settings");
  };

  return (
    <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
      {/* Left side - Logo/Breadcrumb */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-red-400" />
          <span className="text-lg font-semibold text-white">Admin Portal</span>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-4">
        {/* Admin Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                {admin.user?.image ? (
                  <Image
                    src={admin.user.image}
                    alt="Admin"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-300" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">
                  {admin.user?.name || "Admin"}
                </div>
                <div className="text-xs text-slate-400">
                  {admin.user?.email}
                </div>
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-slate-800 border-slate-700"
          >
            <DropdownMenuLabel className="text-slate-300">
              <div className="flex flex-col space-y-1">
                <div className="text-sm font-medium">
                  {admin.user?.name || "Admin User"}
                </div>
                <div className="text-xs text-slate-400">
                  {admin.user?.email}
                </div>
                {admin.isSuperAdmin && (
                  <Badge variant="secondary" className="w-fit text-xs">
                    Super Admin
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={handleSettingsClick}
              className="text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
