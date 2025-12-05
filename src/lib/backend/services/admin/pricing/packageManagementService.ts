// Service for admin package update and deletion

import {
  findPackageById,
  updatePackage as updatePackageRepo,
  deletePackage as deletePackageRepo,
} from "../../../repositories/pricing/tokenPackageRepository";
import { NotFoundError, ValidationError } from "../../../utils/errors";

/**
 * Update a token package (pricing must be updated separately via RolePricing)
 */
export async function updatePackage(
  id: string,
  data: {
    name?: string;
    tokens?: number;
    description?: string | null;
    isActive?: boolean;
  }
) {
  // Validate required fields if provided
  if (data.name !== undefined && !data.name) {
    throw new ValidationError("Name cannot be empty");
  }
  if (data.tokens !== undefined && (!data.tokens || data.tokens <= 0)) {
    throw new ValidationError("Tokens must be a positive number");
  }

  const packageData = await findPackageById(id);
  if (!packageData) {
    throw new NotFoundError("Package");
  }

  return await updatePackageRepo(id, data);
}

/**
 * Soft delete a token package (sets isActive to false)
 */
export async function deletePackage(id: string) {
  const packageData = await findPackageById(id);
  if (!packageData) {
    throw new NotFoundError("Package");
  }

  // Soft delete: set isActive to false instead of hard delete
  // This allows deletion of packages regardless of existing purchases
  await deletePackageRepo(id);
}
