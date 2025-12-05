"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

interface TokenBalance {
  balance: number;
  totalPurchased: number;
  totalConsumed: number;
}

export function useTokenBalance() {
  const { data: session } = useSession();
  const pathname = usePathname?.() as string | undefined;
  const [tokenData, setTokenData] = useState<TokenBalance>({
    balance: 0,
    totalPurchased: 0,
    totalConsumed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/client/tokens/balance");

      if (!response.ok) {
        throw new Error("Failed to fetch token balance");
      }

      const data = await response.json();

      if (data.success) {
        setTokenData({
          balance: data.balance || 0,
          totalPurchased: data.totalPurchased || 0,
          totalConsumed: data.totalConsumed || 0,
        });
      } else {
        throw new Error(data.error || "Failed to fetch balance");
      }
    } catch (err) {
      console.error("Error fetching token balance:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setTokenData({
        balance: 0,
        totalPurchased: 0,
        totalConsumed: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Listen for global tokens updates and refetch when page becomes visible or route changes
  useEffect(() => {
    const handleUpdated = () => {
      fetchBalance();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchBalance();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("tokens:updated", handleUpdated);
      document.addEventListener("visibilitychange", handleVisibility);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("tokens:updated", handleUpdated);
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, [fetchBalance]);

  // Refetch on route changes where the balance is displayed
  useEffect(() => {
    if (pathname) {
      fetchBalance();
    }
  }, [pathname, fetchBalance]);

  return {
    balance: tokenData.balance,
    totalPurchased: tokenData.totalPurchased,
    totalConsumed: tokenData.totalConsumed,
    loading,
    error,
    refetch: fetchBalance,
  };
}
