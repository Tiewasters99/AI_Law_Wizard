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
  // Filter packages to only include those with active role pricing for the specified role
  return packages
    .filter(pkg => {
      if (role) {
        // If role is specified, only return packages with active pricing for that role
        return pkg.RolePricing.some(
          (rp) => rp.role === role && rp.isActive
        );
      }
      // If no role specified, return all packages with any role pricing
      return pkg.RolePricing.length > 0;
    })
    .map(pkg => {
      // Get role-specific price if role is provided
      const rolePricing = role
        ? pkg.RolePricing.find((rp) => rp.role === role && rp.isActive)
        : null;

      return {
        id: pkg.id,
        name: pkg.name,
        tokens: pkg.tokens,
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
