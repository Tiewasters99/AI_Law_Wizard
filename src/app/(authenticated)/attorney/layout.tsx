"use client";

import { useEffect, useState } from "react";

interface AttorneyLayoutProps {
  children: React.ReactNode;
}

export default function AttorneyLayout({ children }: AttorneyLayoutProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(
          "/api/attorney/notifications/unread-count"
        );
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
