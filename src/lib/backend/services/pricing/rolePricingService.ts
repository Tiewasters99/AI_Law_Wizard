// Service for role-specific pricing functionality

import { findActivePackagesByRole } from "../../repositories/pricing/tokenPackageRepository";
import type { Role } from "@prisma/client";

export interface RolePricingPackageResponse {
  id: string;
  name: string;
  tokens: number;
  priceInCents: number;
  originalPriceInCents: number;
  hasRoleDiscount: boolean;
  description: string | null;
  isActive: boolean;
}

export interface RolePricingResponse {
  role: string;
  packages: RolePricingPackageResponse[];
}

/**
 * Get active token packages with role-specific pricing
 */
export async function getRolePricingPackages(
  role: Role
): Promise<RolePricingResponse> {
  const packages = await findActivePackagesByRole(role);

  // Transform the data, using role-specific pricing
  // Note: findActivePackagesByRole already filters to only include packages with active role pricing
  const transformedPackages: RolePricingPackageResponse[] = packages
    .filter(pkg => pkg.RolePricing.length > 0)
    .map(pkg => {
      const rolePricing = pkg.RolePricing.find(
        rp => rp.role === role && rp.isActive
      );

      if (!rolePricing) {
        // This shouldn't happen since findActivePackagesByRole filters by role,
        // but handle it gracefully
        return null;
      }

      const finalPrice = rolePricing.priceInCents;

      return {
        id: pkg.id,
        name: pkg.name,
        tokens: pkg.tokens,
        priceInCents: finalPrice,
        originalPriceInCents: finalPrice, // No base price anymore, use role price as original
        hasRoleDiscount: false, // All pricing is role-specific now
        description: pkg.description,
        isActive: pkg.isActive,
      };
    })
    .filter((pkg): pkg is RolePricingPackageResponse => pkg !== null);

  return {
    role,
    packages: transformedPackages,
  };
}
