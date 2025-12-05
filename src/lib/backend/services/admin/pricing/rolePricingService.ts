// Service for admin role pricing

import {
  findPackageById,
  findPackageByIdWithRolePricing,
} from "../../../repositories/pricing/tokenPackageRepository";
import { findRolePricingByPackageAndRole } from "../../../repositories/admin/rolePricingRepository";
import { NotFoundError, ValidationError } from "../../../utils/errors";

/**
 * Get role pricing for a package
 */
export async function getRolePricing(
  packageId: string,
  role: "ATTORNEY" | "CUSTOMER"
) {
  if (!["ATTORNEY", "CUSTOMER"].includes(role)) {
    throw new ValidationError("Invalid role");
  }

  // Get the package with role-specific pricing
  const packageData = await findPackageByIdWithRolePricing(packageId, role);

  if (!packageData) {
    throw new NotFoundError("Package");
  }

  // Return role-specific price
  const rolePricing = packageData.RolePricing[0];

  if (!rolePricing) {
    throw new NotFoundError(`Role pricing for ${role} on package ${packageId}`);
  }

  return { priceInCents: rolePricing.priceInCents };
}
