"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTokenBalance } from "./useTokenBalance";

export interface ConsumeTokensOptions {
  amount: number;
  description: string;
  feature?: string;
  metadata?: Record<string, any>;
}

export function useTokenConsumption() {
  const { data: session } = useSession();
  const { refetch: refetchBalance } = useTokenBalance();
  const [isConsuming, setIsConsuming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const consumeTokens = useCallback(
    async (options: ConsumeTokensOptions) => {
      if (!session?.user?.id) {
        setError("User not authenticated");
        return { success: false, error: "User not authenticated" };
      }

      setIsConsuming(true);
      setError(null);

      try {
        const response = await fetch("/api/client/tokens/consume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(options),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          const errorMessage =
            data.error || data.message || "Failed to consume tokens";
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }

        // Refetch balance to update UI
        await refetchBalance();

        return {
          success: true,
          newBalance: data.newBalance,
          amount: data.amount,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to consume tokens";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsConsuming(false);
      }
    },
    [session?.user?.id, refetchBalance]
  );

  return {
    consumeTokens,
    isConsuming,
    error,
  };
}
