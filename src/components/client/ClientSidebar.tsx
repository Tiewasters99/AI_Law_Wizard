"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { AlertCircle } from "lucide-react";
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
      {
        label: "Document Assistant",
        href: "/client/document-assistant",
        icon: FileText,
      },
      { label: "Chat History", href: "/client/chat-history", icon: History },
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
  const router = useRouter();
  const { data: session } = useSession();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hasViewedMessagesPage, setHasViewedMessagesPage] = useState(false);
  const { counts, error: notificationError } = useNotifications();
  const { balance: currentTokens, loading: tokenLoading } = useTokenBalance();

  // Ensure counts always has default values to prevent UI breakage
  const safeCounts = useMemo(
    () => ({
      notifications: counts?.notifications ?? 0,
      messages: counts?.messages ?? 0,
      pendingRequests: counts?.pendingRequests ?? 0,
      total: counts?.total ?? 0,
    }),
    [counts]
  );

  // Determine if balance is low (less than 10 credits)
  const isLowBalance = useMemo(() => currentTokens < 10, [currentTokens]);

  const handleCreditsClick = useCallback(() => {
    router.push("/client/tokens");
  }, [router]);

  // Check if messages page has been viewed
  useEffect(() => {
    if (session?.user?.id) {
      const viewedKey = `messages-page-viewed-${session.user.id}`;
      const checkViewed = () => {
        const viewed = localStorage.getItem(viewedKey) === "true";
        setHasViewedMessagesPage(viewed);
      };

      // Check initially
      checkViewed();

      // Listen for storage changes (when messages page marks itself as viewed)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === viewedKey) {
          checkViewed();
        }
      };

      window.addEventListener("storage", handleStorageChange);

      // Also listen for custom event for same-tab updates
      const handleCustomStorageChange = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail?.key === viewedKey) {
          checkViewed();
        }
      };

      window.addEventListener(
        "localStorageChange",
        handleCustomStorageChange as EventListener
      );

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener(
          "localStorageChange",
          handleCustomStorageChange as EventListener
        );
      };
    }
  }, [session?.user?.id]);

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
          {Object.entries(clientNavigation).map(([sectionKey, section]) => (
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
                  const showBadge =
                    (item.badge === "unread" &&
                      safeCounts.messages > 0 &&
                      !hasViewedMessagesPage) ||
                    (item.badge === "pending" &&
                      safeCounts.pendingRequests > 0);
                  const badgeCount =
                    item.badge === "unread"
                      ? safeCounts.messages
                      : safeCounts.pendingRequests;

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
                            className={`ml-3 text-sm font-medium transition-colors relative z-10 ${
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
                              className="ml-auto text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center"
                            >
                              {badgeCount > 9 ? "9+" : badgeCount}
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
                              {badgeCount}
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
          <button
            onClick={handleCreditsClick}
            className="w-full p-3 rounded-lg bg-accent/50 border border-primary/20 hover:bg-accent/70 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-primary">
                My Credits
              </span>
              <div className="flex items-center gap-2">
                {isLowBalance && (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
                <Coins className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p
                className={`text-lg font-bold ${
                  isLowBalance ? "text-destructive" : "text-foreground"
                }`}
              >
                {tokenLoading ? "..." : currentTokens.toLocaleString()}
              </p>
              {isLowBalance && (
                <span className="text-xs text-destructive font-medium">
                  Low
                </span>
              )}
            </div>
          </button>
        </div>
      )}
    </motion.div>
  );
}
