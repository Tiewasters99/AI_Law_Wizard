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

      const response = await fetch("/api/client/notifications/unread-count", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Check if response is ok
      if (!response.ok) {
        // Try to parse error response as JSON
        let errorMessage = `Failed to fetch notification counts (${response.status})`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } else {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}: ${errorText.substring(0, 100)}`;
            }
          }
        } catch (parseError) {
          // If we can't parse the error, use the default message
          console.warn("Could not parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      // Check content type before parsing JSON
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Invalid response format: expected JSON");
      }

      // Parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        throw new Error("Invalid JSON response from server");
      }

      // Handle response data
      if (data.success) {
        setCounts({
          notifications: data.notifications || 0,
          messages: data.messages || 0,
          pendingRequests: data.pendingRequests || 0,
          total: data.total || 0,
        });
        setError(null); // Clear any previous errors on success
      } else {
        // API returned success: false
        const errorMsg = data.error || data.message || "Failed to fetch counts";
        throw new Error(errorMsg);
      }
    } catch (err) {
      // Handle different types of errors
      let errorMessage = "Unknown error";

      if (err instanceof TypeError && err.message.includes("fetch")) {
        // Network error (e.g., "Failed to fetch")
        errorMessage = "Network error: Unable to connect to server";
        console.error("Network error fetching notification counts:", err);
      } else if (err instanceof Error) {
        errorMessage = err.message;
        console.error("Error fetching notification counts:", err);
      } else {
        console.error("Unknown error fetching notification counts:", err);
      }

      setError(errorMessage);
      // Set default counts to prevent UI breakage
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

  // Optional: allow other components to trigger a refresh without props
  useEffect(() => {
    const handleOpen = () => {
      fetchCounts();
    };
    window.addEventListener("notifications:open", handleOpen as EventListener);
    return () => {
      window.removeEventListener(
        "notifications:open",
        handleOpen as EventListener
      );
    };
  }, [fetchCounts]);

  return {
    counts,
    loading,
    error,
    refetch: fetchCounts,
  };
}
