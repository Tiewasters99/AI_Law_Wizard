"use client";

import { useState, useEffect } from "react";

interface FeatureFlagResult {
  enabled: boolean;
  loading: boolean;
  error?: string;
}

export function useFeatureFlag(
  featureName: string,
  role: "ATTORNEY" | "CUSTOMER"
): FeatureFlagResult {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const checkFeatureFlag = async () => {
      try {
        setLoading(true);
        setError(undefined);

        const response = await fetch("/api/admin/features/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            featureName,
            role,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setEnabled(data.enabled);
        } else {
          setError("Failed to check feature flag");
          setEnabled(false);
        }
      } catch (err) {
        setError("Network error checking feature flag");
        setEnabled(false);
      } finally {
        setLoading(false);
      }
    };

    checkFeatureFlag();
  }, [featureName, role]);

  return { enabled, loading, error };
}
