// Service for attorney token packages functionality

import { findActivePackages } from "../../../repositories/pricing/tokenPackageRepository";
import { createPackage } from "../../../repositories/pricing/tokenPackageRepository";

/**
 * Get all active token packages
 */
export async function getTokenPackages() {
  return await findActivePackages();
}

/**
 * Create a new token package (admin/attorney function)
 * Note: Pricing must be added separately via RolePricing
 */
export async function createTokenPackage(data: {
  name: string;
  tokens: number;
  description?: string;
}) {
  return await createPackage({
    name: data.name,
    tokens: data.tokens,
    description: data.description,
  });
}
