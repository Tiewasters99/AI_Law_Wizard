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
      className="relative h-full flex flex-col border-r backdrop-blur-xl bg-gradient-to-b from-slate-50 to-slate-100 border-slate-200 shadow-sm"
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-50 w-6 h-6 rounded-full border shadow-md bg-white/90 border-slate-300 flex items-center justify-center transition-all hover:shadow-lg hover:scale-110"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-slate-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-slate-600" />
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
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
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
                        !isActive && "hover:bg-slate-100"
                      }`}
                      style={{
                        backgroundColor: isActive
                          ? "rgba(239, 246, 255, 0.8)"
                          : "transparent",
                        borderLeft: isActive
                          ? "3px solid #1e40af"
                          : "3px solid transparent",
                        padding: isCollapsed ? "12px" : "10px 12px",
                        justifyContent: isCollapsed ? "center" : "flex-start",
                      }}
                    >
                      <div
                        className={
                          isActive
                            ? "text-blue-700 group-hover:text-blue-700"
                            : "text-slate-600 group-hover:text-slate-900"
                        }
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                      </div>

                      {!isCollapsed && (
                        <>
                          <span
                            className={`ml-3 text-sm font-medium ${
                              isActive
                                ? "text-blue-900 font-semibold"
                                : "text-slate-700 group-hover:text-slate-900"
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
                        <div className="absolute left-full ml-2 px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none bg-slate-900 text-white text-xs">
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
        <div className="p-4 border-t border-slate-200">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-900">
                Service Credits
              </span>
              <Coins className="w-4 h-4 text-blue-700" />
            </div>
            <p className="text-lg font-bold text-blue-900">
              {tokenLoading ? "Loading..." : currentTokens.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
