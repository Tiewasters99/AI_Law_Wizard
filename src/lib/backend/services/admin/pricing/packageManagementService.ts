// Service for admin package update and deletion

import {
  findPackageById,
  updatePackage as updatePackageRepo,
  deletePackage as deletePackageRepo,
  hasPackagePurchases,
} from "../../../repositories/pricing/tokenPackageRepository";
import { NotFoundError, ValidationError } from "../../../utils/errors";

/**
 * Update a token package
 */
export async function updatePackage(
  id: string,
  data: {
    name?: string;
    tokens?: number;
    priceInCents?: number;
    description?: string | null;
    isActive?: boolean;
  }
) {
  // Validate required fields if provided
  if (data.name !== undefined && !data.name) {
    throw new ValidationError("Name cannot be empty");
  }
  if (data.tokens !== undefined && (!data.tokens || data.tokens < 0)) {
    throw new ValidationError("Tokens must be a positive number");
  }
  if (data.priceInCents !== undefined && data.priceInCents < 0) {
    throw new ValidationError("Price must be a positive number");
  }

  const packageData = await findPackageById(id);
  if (!packageData) {
    throw new NotFoundError("Package");
  }

  return await updatePackageRepo(id, data);
}

/**
 * Delete a token package
 */
export async function deletePackage(id: string) {
  const packageData = await findPackageById(id);
  if (!packageData) {
    throw new NotFoundError("Package");
  }

  // Check if package has any purchases
  const hasPurchases = await hasPackagePurchases(id);
  if (hasPurchases) {
    throw new ValidationError("Cannot delete package with existing purchases");
  }

  await deletePackageRepo(id);
}

