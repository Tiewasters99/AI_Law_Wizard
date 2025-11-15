"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Scale,
  DollarSign,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
}

interface NavigationSection {
  label: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  items: NavigationItem[];
}

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// Navigation config
const adminNavigation: Record<string, NavigationSection> = {
  overview: {
    label: "Overview",
    icon: LayoutDashboard,
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  userManagement: {
    label: "User Management",
    icon: Users,
    items: [
      {
        label: "Clients",
        href: "/admin/clients",
        icon: Users,
      },
      {
        label: "Attorneys",
        href: "/admin/attorneys",
        icon: Scale,
      },
    ],
  },
  systemManagement: {
    label: "System Management",
    icon: Settings,
    items: [
      {
        label: "Pricing Management",
        href: "/admin/pricing",
        icon: DollarSign,
      },
    ],
  },
  settings: {
    label: "Settings",
    icon: FileText,
    items: [
      {
        label: "Activity Logs",
        href: "/admin/logs",
        icon: FileText,
      },
      {
        label: "Admin Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
};

export function AdminSidebar({ isCollapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleMouseEnter = useCallback((href: string) => {
    setHoveredItem(href);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredItem(null);
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="relative h-full flex flex-col bg-sidebar border-r border-sidebar-border shadow-lg"
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-50 w-6 h-6 rounded-full border shadow-md bg-sidebar-accent border-sidebar-border flex items-center justify-center transition-all hover:shadow-lg hover:scale-110 hover:bg-sidebar-accent"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-sidebar-foreground/70" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-sidebar-foreground/70" />
        )}
      </button>

      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-destructive rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">Admin Portal</h2>
              <p className="text-xs text-sidebar-foreground/70">System Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
        <div className="space-y-6">
          {Object.entries(adminNavigation).map(([sectionKey, section]) => (
            <div key={sectionKey}>
              {/* Section Header */}
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70">
                    {section.label}
                  </h3>
                </div>
              )}

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onMouseEnter={() => handleMouseEnter(item.href)}
                      onMouseLeave={handleMouseLeave}
                      className={`relative flex items-center rounded-lg transition-all group ${
                        !isActive && "hover:bg-sidebar-accent"
                      } ${
                        isActive
                          ? "bg-destructive/10 border-l-[3px] border-l-destructive"
                          : "border-l-[3px] border-l-transparent"
                      }`}
                      style={{
                        padding: isCollapsed ? "12px" : "10px 12px",
                        justifyContent: isCollapsed ? "center" : "flex-start",
                      }}
                    >
                      <div
                        className={
                          isActive
                            ? "text-destructive group-hover:text-destructive"
                            : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                        }
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                      </div>

                      {!isCollapsed && (
                        <span
                          className={`ml-3 text-sm font-medium ${
                            isActive
                              ? "text-destructive font-semibold"
                              : "text-sidebar-foreground/80 group-hover:text-sidebar-foreground"
                          }`}
                        >
                          {item.label}
                        </span>
                      )}

                      {/* Collapsed Tooltip */}
                      {isCollapsed && hoveredItem === item.href && (
                        <div className="absolute left-full ml-2 px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none bg-sidebar border border-sidebar-border text-sidebar-foreground text-xs">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="p-3 rounded-lg bg-sidebar-accent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-sidebar-foreground/80">
                Admin Status
              </span>
              <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
            </div>
            <p className="text-sm text-sidebar-foreground/70">System Online</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
