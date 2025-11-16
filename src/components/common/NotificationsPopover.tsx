"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationsPopoverProps {
  withBadge?: boolean;
}

export function NotificationsPopover({
  withBadge = true,
}: NotificationsPopoverProps) {
  const { counts, refetch } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative border-border hover:bg-muted"
          onClick={() => {
            window.dispatchEvent(new Event("notifications:open"));
            refetch();
          }}
        >
          <Bell className="w-5 h-5 text-foreground" />
          {withBadge && counts.total > 0 && (
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
  );
}
