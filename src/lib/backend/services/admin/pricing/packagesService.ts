// Service for admin token packages management

import {
  findAllPackages,
  createPackage as createPackageRepo,
} from "../../../repositories/pricing/tokenPackageRepository";
import { ValidationError } from "../../../utils/errors";

/**
 * List all token packages
 */
export async function listPackages() {
  return await findAllPackages();
}

/**
 * Create a new token package (without pricing - pricing must be added separately via RolePricing)
 */
export async function createPackage(data: {
  name: string;
  tokens: number;
  description?: string | null;
  isActive?: boolean;
}) {
  // Validate required fields
  if (!data.name || !data.tokens) {
    throw new ValidationError("Name and tokens are required");
  }

  if (data.tokens <= 0) {
    throw new ValidationError("Tokens must be greater than 0");
  }

  return await createPackageRepo(data);
}
