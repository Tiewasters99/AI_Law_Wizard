// Service for pricing packages functionality

import { findActivePackages } from "../../repositories/pricing/tokenPackageRepository";

export interface TokenPackageResponse {
  id: string;
  name: string;
  tokens: number;
  priceInCents: number;
  description: string | null;
  isActive: boolean;
  RolePricing: Array<{
    id: string;
    role: string;
    priceInCents: number;
    isActive: boolean;
  }>;
}

/**
 * Get all active token packages with role pricing
 */
export async function getActivePackages(): Promise<TokenPackageResponse[]> {
  const packages = await findActivePackages();

  // Transform the data for frontend consumption
  return packages.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    tokens: pkg.tokens,
    priceInCents: pkg.priceInCents,
    description: pkg.description,
    isActive: pkg.isActive,
    RolePricing: pkg.RolePricing.map(rp => ({
      id: rp.id,
      role: rp.role,
      priceInCents: rp.priceInCents,
      isActive: rp.isActive,
    })),
  }));
}
