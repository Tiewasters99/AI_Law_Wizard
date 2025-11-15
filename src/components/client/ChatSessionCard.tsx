"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/frontend/utils";

export interface ChatSession {
  id: string;
  title: string | null;
  userId: string | null;
  isActive: boolean;
  metadata: any;
  createdAt: Date | string;
  updatedAt: Date | string;
  messageCount?: number;
  lastMessage?: string;
  chatType?: "wizard" | "grand-wizard";
}

interface ChatSessionCardProps {
  session: ChatSession;
  onDelete: (sessionId: string) => void;
  isDeleting?: boolean;
  className?: string;
}

export function ChatSessionCard({
  session,
  onDelete,
  isDeleting = false,
  className,
}: ChatSessionCardProps) {
  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "Invalid date";

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    }).format(d);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat session?")) {
      onDelete(session.id);
    }
  };

  const displayTitle = session.title || "Untitled Chat";
  const preview = session.lastMessage
    ? session.lastMessage.substring(0, 100) +
      (session.lastMessage.length > 100 ? "..." : "")
    : "No messages yet";

  const chatPage =
    session.chatType === "grand-wizard"
      ? "/client/grand-wizard"
      : "/client/wizard";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`${chatPage}?sessionId=${session.id}`}>
        <Card
          className={cn(
            "group relative cursor-pointer transition-all duration-200 hover:shadow-md border-border bg-card",
            isDeleting && "opacity-50 pointer-events-none",
            className
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground truncate">
                    {displayTitle}
                  </h3>
                  {session.isActive && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {preview}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(session.updatedAt)}</span>
                  </div>
                  {session.messageCount !== undefined && (
                    <span>
                      {session.messageCount} message
                      {session.messageCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label="Delete session"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
