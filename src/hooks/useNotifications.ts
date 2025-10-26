"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface NotificationCounts {
  notifications: number;
  messages: number;
  pendingRequests: number;
  total: number;
}

export function useNotifications() {
  const { data: session } = useSession();
  const [counts, setCounts] = useState<NotificationCounts>({
    notifications: 0,
    messages: 0,
    pendingRequests: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/client/notifications/unread-count");

      if (!response.ok) {
        throw new Error("Failed to fetch notification counts");
      }

      const data = await response.json();

      if (data.success) {
        setCounts({
          notifications: data.notifications || 0,
          messages: data.messages || 0,
          pendingRequests: data.pendingRequests || 0,
          total: data.total || 0,
        });
      } else {
        throw new Error(data.error || "Failed to fetch counts");
      }
    } catch (err) {
      console.error("Error fetching notification counts:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setCounts({
        notifications: 0,
        messages: 0,
        pendingRequests: 0,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Fetch counts on mount and when session changes
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (!session?.user?.id) return;

    const interval = setInterval(fetchCounts, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [session?.user?.id, fetchCounts]);

  return {
    counts,
    loading,
    error,
    refetch: fetchCounts,
  };
}
