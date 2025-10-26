"use client";

import { useState, useEffect } from "react";

interface RolePricingResult {
  price: number;
  loading: boolean;
  error?: string;
}

export function useRolePricing(
  packageId: string,
  role: "ATTORNEY" | "CUSTOMER"
): RolePricingResult {
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const fetchRolePricing = async () => {
      try {
        setLoading(true);
        setError(undefined);

        const response = await fetch(
          `/api/admin/pricing/role-pricing?packageId=${packageId}&role=${role}`
        );

        if (response.ok) {
          const data = await response.json();
          setPrice(data.priceInCents);
        } else {
          setError("Failed to fetch role pricing");
          setPrice(0);
        }
      } catch (err) {
        setError("Network error fetching role pricing");
        setPrice(0);
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchRolePricing();
    }
  }, [packageId, role]);

  return { price, loading, error };
}
