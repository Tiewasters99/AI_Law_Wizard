"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Users,
  Scale,
  DollarSign,
  FileText,
  Settings,
  Download,
} from "lucide-react";

interface QuickAction {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  variant?: "default" | "outline" | "secondary";
}

const quickActions: QuickAction[] = [
  {
    label: "Add User",
    description: "Create a new customer or attorney account",
    icon: Plus,
    href: "/admin/users/new",
    variant: "default",
  },
  {
    label: "Update Pricing",
    description: "Modify token package pricing",
    icon: DollarSign,
    href: "/admin/pricing",
    variant: "outline",
  },
  {
    label: "View Reports",
    description: "Generate system reports and analytics",
    icon: FileText,
    href: "/admin/reports",
    variant: "outline",
  },
  {
    label: "Export Data",
    description: "Download user and usage data",
    icon: Download,
    href: "/admin/export",
    variant: "secondary",
  },
  {
    label: "System Settings",
    description: "Configure system-wide settings",
    icon: Settings,
    href: "/admin/settings",
    variant: "secondary",
  },
];

export function QuickActions() {
  const handleActionClick = useCallback((href: string) => {
    // In a real app, this would navigate to the href
    console.log(`Navigate to ${href}`);
  }, []);

  return (
    <div className="space-y-3">
      {quickActions.map((action, index) => {
        const Icon = action.icon;

        return (
          <Card
            key={index}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleActionClick(action.href)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 text-sm">
                    {action.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {action.description}
                  </p>
                </div>
                <Button
                  variant={action.variant || "outline"}
                  size="sm"
                  className="text-xs"
                >
                  Go
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* System Status */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium text-green-800">
              System Online
            </span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            All services operational
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
