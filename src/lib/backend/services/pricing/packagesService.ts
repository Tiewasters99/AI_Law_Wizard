// Service for pricing packages functionality

import {
  findActivePackages,
  findActivePackagesByRole,
} from "../../repositories/pricing/tokenPackageRepository";
import type { Role } from "@prisma/client";

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
 * @param role - Optional role to filter packages by. If provided, only returns packages with active pricing for that role.
 */
export async function getActivePackages(
  role?: Role
): Promise<TokenPackageResponse[]> {
  // Use role-specific query if role is provided
  const packages = role
    ? await findActivePackagesByRole(role)
    : await findActivePackages();

  // Transform the data for frontend consumption
  return packages.map(pkg => {
    // If role is specified, use role-specific price, otherwise use base price
    const rolePricing = pkg.RolePricing.find(
      (rp) => rp.role === role && rp.isActive
    );
    const priceInCents = rolePricing
      ? rolePricing.priceInCents
      : pkg.priceInCents;

    return {
      id: pkg.id,
      name: pkg.name,
      tokens: pkg.tokens,
      priceInCents: priceInCents,
      description: pkg.description,
      isActive: pkg.isActive,
      RolePricing: pkg.RolePricing.map(rp => ({
        id: rp.id,
        role: rp.role,
        priceInCents: rp.priceInCents,
        isActive: rp.isActive,
      })),
    };
  });
}
