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

  // Transform the data, using role-specific pricing if available, otherwise base price
  const transformedPackages: RolePricingPackageResponse[] = packages.map(pkg => {
    const rolePricing = pkg.RolePricing[0];
    const finalPrice = rolePricing
      ? rolePricing.priceInCents
      : pkg.priceInCents;

    return {
      id: pkg.id,
      name: pkg.name,
      tokens: pkg.tokens,
      priceInCents: finalPrice,
      originalPriceInCents: pkg.priceInCents,
      hasRoleDiscount:
        rolePricing && rolePricing.priceInCents !== pkg.priceInCents,
      description: pkg.description,
      isActive: pkg.isActive,
    };
  });

  return {
    role,
    packages: transformedPackages,
  };
}

