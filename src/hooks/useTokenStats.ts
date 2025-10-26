"use client";

import { useState, useEffect, useCallback } from "react";
import { TokenStats } from "@/types/admin";

interface TokenStatsResult {
  stats: TokenStats | null;
  loading: boolean;
  error?: string;
  refetch: () => void;
}

export function useTokenStats(userId: string): TokenStatsResult {
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const response = await fetch(`/api/admin/users/${userId}/tokens`);

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError("Failed to fetch token stats");
        setStats(null);
      }
    } catch (err) {
      setError("Network error fetching token stats");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchStats();
    }
  }, [userId, fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
