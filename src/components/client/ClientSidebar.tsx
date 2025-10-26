"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { colors } from "@/lib/frontend/designSystem";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import {
  Search,
  FileCheck,
  Bot,
  Crown,
  History,
  MessageSquare,
  Files,
  BookOpen,
  FileText,
  Globe,
  User,
  Coins,
  ChevronLeft,
  ChevronRight,
  Folder,
} from "lucide-react";

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

interface ClientSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  unreadCount?: number;
  pendingRequestsCount?: number;
}

// Move navigation config outside component to prevent re-creation
const clientNavigation: Record<string, NavigationSection> = {
  findLegalHelp: {
    label: "Find Legal Help",
    icon: Search,
    items: [
      {
        label: "Find Attorney",
        href: "/client/directory",
        icon: Search,
        badge: null,
      },
      {
        label: "My Requests",
        href: "/client/inbox",
        icon: FileCheck,
        badge: "pending",
      },
    ],
  },
  aiTools: {
    label: "AI Tools",
    icon: Bot,
    items: [
      { label: "Legal Assistant", href: "/client/wizard", icon: Bot },
      {
        label: "Advanced Assistant",
        href: "/client/grand-wizard",
        icon: Crown,
      },
      { label: "Chat History", href: "/client/legal-chat", icon: History },
    ],
  },
  mySpace: {
    label: "My Space",
    icon: Folder,
    items: [
      {
        label: "Messages",
        href: "/client/inbox",
        icon: MessageSquare,
        badge: "unread",
      },
      { label: "My Documents", href: "/client/integrations", icon: Files },
    ],
  },
  resources: {
    label: "Resources",
    icon: BookOpen,
    items: [
      { label: "Legal Blog", href: "/client/blog", icon: FileText },
      { label: "Miniverse™", href: "/client/miniverse", icon: Globe },
    ],
  },
  account: {
    label: "Account",
    icon: User,
    items: [
      { label: "My Profile", href: "/client/profile", icon: User },
      { label: "My Credits", href: "/client/tokens", icon: Coins },
    ],
  },
};

export function ClientSidebar({
  isCollapsed,
  onToggle,
  unreadCount = 0,
  pendingRequestsCount = 0,
}: ClientSidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { counts } = useNotifications();
  const { balance: currentTokens, loading: tokenLoading } = useTokenBalance();

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
      className="relative h-full flex flex-col border-r backdrop-blur-xl"
      style={{
        backgroundColor: "rgba(248, 250, 252, 0.8)",
        borderColor: "rgba(226, 232, 240, 0.5)",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-50 w-6 h-6 rounded-full border shadow-md flex items-center justify-center transition-all hover:shadow-lg hover:scale-110 backdrop-blur-lg"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderColor: "rgba(226, 232, 240, 0.6)",
        }}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight
            className="w-4 h-4"
            style={{ color: colors.secondary[600] }}
          />
        ) : (
          <ChevronLeft
            className="w-4 h-4"
            style={{ color: colors.secondary[600] }}
          />
        )}
      </button>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3">
        <div className="space-y-6">
          {Object.entries(clientNavigation).map(([sectionKey, section]) => (
            <div key={sectionKey}>
              {/* Section Header */}
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.secondary[600] }}
                  >
                    {section.label}
                  </h3>
                </div>
              )}

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const showBadge =
                    (item.badge === "unread" && counts.messages > 0) ||
                    (item.badge === "pending" && counts.pendingRequests > 0);
                  const badgeCount =
                    item.badge === "unread"
                      ? counts.messages
                      : counts.pendingRequests;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onMouseEnter={() => handleMouseEnter(item.href)}
                      onMouseLeave={handleMouseLeave}
                      className="relative flex items-center rounded-lg transition-all group"
                      style={{
                        backgroundColor: isActive
                          ? "rgba(239, 246, 255, 0.8)"
                          : "transparent",
                        borderLeft: isActive
                          ? `3px solid ${colors.primary[700]}`
                          : "3px solid transparent",
                        padding: isCollapsed ? "12px" : "10px 12px",
                        justifyContent: isCollapsed ? "center" : "flex-start",
                        backdropFilter: isActive ? "blur(8px)" : "none",
                      }}
                    >
                      <div
                        className="transition-colors relative z-10"
                        style={{
                          color: isActive
                            ? colors.primary[700]
                            : colors.secondary[600],
                        }}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                      </div>

                      {!isCollapsed && (
                        <>
                          <span
                            className="ml-3 text-sm font-medium transition-colors relative z-10"
                            style={{
                              color: isActive
                                ? colors.primary[900]
                                : colors.text,
                            }}
                          >
                            {item.label}
                          </span>

                          {showBadge && (
                            <Badge
                              variant="destructive"
                              className="ml-auto text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center"
                            >
                              {badgeCount > 9 ? "9+" : badgeCount}
                            </Badge>
                          )}
                        </>
                      )}

                      {/* Collapsed Tooltip */}
                      {isCollapsed && hoveredItem === item.href && (
                        <div
                          className="absolute left-full ml-2 px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none backdrop-blur-xl"
                          style={{
                            backgroundColor: "rgba(30, 41, 59, 0.95)",
                            color: "white",
                            fontSize: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          {item.label}
                          {showBadge && (
                            <Badge
                              variant="destructive"
                              className="ml-2 text-xs px-1.5 py-0.5"
                            >
                              {badgeCount}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Hover Background */}
                      {!isActive && (
                        <div
                          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm"
                          style={{
                            backgroundColor: "rgba(241, 245, 249, 0.6)",
                            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                          }}
                        />
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
        <div
          className="p-4 border-t backdrop-blur-sm"
          style={{ borderColor: "rgba(226, 232, 240, 0.5)" }}
        >
          <div
            className="p-3 rounded-lg backdrop-blur-md"
            style={{
              backgroundColor: "rgba(239, 246, 255, 0.7)",
              border: "1px solid rgba(59, 130, 246, 0.1)",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-medium"
                style={{ color: colors.primary[900] }}
              >
                My Credits
              </span>
              <Coins
                className="w-4 h-4"
                style={{ color: colors.primary[700] }}
              />
            </div>
            <p
              className="text-lg font-bold"
              style={{ color: colors.primary[900] }}
            >
              {tokenLoading ? "..." : currentTokens.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
