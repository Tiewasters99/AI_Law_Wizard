"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  MessageSquare,
  Scale,
  Brain,
  Crown,
  History,
  BookOpen,
  FileText,
  Globe,
  User,
  Coins,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  Gavel,
  Cloud,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  badge?: string | null;
}

interface NavigationSection {
  label: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  items: NavigationItem[];
}

interface AttorneySidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  unreadCount?: number;
}

// Navigation config
const attorneyNavigation: Record<string, NavigationSection> = {
  clientManagement: {
    label: "Client Management",
    icon: Users,
    items: [
      {
        label: "Directory",
        href: "/attorney/directory",
        icon: Users,
        badge: null,
      },
      {
        label: "Inbox",
        href: "/attorney/inbox",
        icon: MessageSquare,
        badge: "unread",
      },
    ],
  },
  legalTools: {
    label: "Legal Tools",
    icon: Scale,
    items: [
      { label: "Document Analysis", href: "/attorney/wizard", icon: Brain },
      {
        label: "Advanced Analysis",
        href: "/attorney/grand-wizard",
        icon: Crown,
      },
      {
        label: "Query History",
        href: "/attorney/query-history",
        icon: History,
      },
    ],
  },
  courtIntegration: {
    label: "Court Integration",
    icon: Gavel,
    items: [
      {
        label: "Docket Genie",
        href: "/attorney/docket-genie",
        icon: FileSearch,
      },
    ],
  },
  resources: {
    label: "Resources",
    icon: BookOpen,
    items: [
      { label: "Legal Blog", href: "/attorney/blog", icon: FileText },
      { label: "Miniverse", href: "/attorney/miniverse", icon: Globe },
      { label: "Integrations", href: "/attorney/integrations", icon: Cloud },
    ],
  },
  account: {
    label: "Account",
    icon: User,
    items: [
      { label: "Profile", href: "/attorney/profile", icon: User },
      { label: "Service Credits", href: "/attorney/tokens", icon: Coins },
    ],
  },
};

export function AttorneySidebar({
  isCollapsed,
  onToggle,
  unreadCount = 0,
}: AttorneySidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const currentTokens = 0; // TODO: Get from store
  const tokenLoading = false;

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
      className="relative h-full flex flex-col border-r border-sidebar-border bg-sidebar shadow-sm"
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-50 w-6 h-6 rounded-full border shadow-md bg-background border-border flex items-center justify-center transition-all hover:shadow-lg hover:scale-110 hover:bg-muted"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3">
        <div className="space-y-6">
          {Object.entries(attorneyNavigation).map(([sectionKey, section]) => (
            <div key={sectionKey}>
              {/* Section Header */}
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.label}
                  </h3>
                </div>
              )}

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const showBadge = item.badge === "unread" && unreadCount > 0;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onMouseEnter={() => handleMouseEnter(item.href)}
                      onMouseLeave={handleMouseLeave}
                      className={`relative flex items-center rounded-lg transition-all group ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                      style={{
                        padding: isCollapsed ? "12px" : "10px 12px",
                        justifyContent: isCollapsed ? "center" : "flex-start",
                      }}
                    >
                      <div
                        className={
                          isActive
                            ? "text-primary"
                            : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
                        }
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                      </div>

                      {!isCollapsed && (
                        <>
                          <span
                            className={`ml-3 text-sm font-medium ${
                              isActive
                                ? "text-primary font-semibold"
                                : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
                            }`}
                          >
                            {item.label}
                          </span>

                          {showBadge && (
                            <Badge
                              variant="destructive"
                              className="ml-auto text-xs px-1.5 py-0.5 min-w-[20px] h-5"
                            >
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </Badge>
                          )}
                        </>
                      )}

                      {/* Collapsed Tooltip */}
                      {isCollapsed && hoveredItem === item.href && (
                        <div className="absolute left-full ml-2 px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none bg-popover text-popover-foreground border border-border text-xs">
                          {item.label}
                          {showBadge && (
                            <Badge
                              variant="destructive"
                              className="ml-2 text-xs px-1.5 py-0.5"
                            >
                              {unreadCount}
                            </Badge>
                          )}
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

      {/* Bottom Stats Widget */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="p-3 rounded-lg bg-accent/50 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-primary">
                Service Credits
              </span>
              <Coins className="w-4 h-4 text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground">
              {tokenLoading ? "Loading..." : currentTokens.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
