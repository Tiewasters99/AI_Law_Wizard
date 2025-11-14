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
 * Create a new token package
 */
export async function createPackage(data: {
  name: string;
  tokens: number;
  priceInCents: number;
  description?: string | null;
  isActive?: boolean;
}) {
  // Validate required fields
  if (!data.name || !data.tokens || data.priceInCents === undefined) {
    throw new ValidationError("Name, tokens, and price are required");
  }

  return await createPackageRepo(data);
}

