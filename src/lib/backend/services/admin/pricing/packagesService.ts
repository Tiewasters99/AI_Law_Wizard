// Service for admin token packages management

import {
  findAllPackages,
  createPackage as createPackageRepo,
} from "../../../repositories/pricing/tokenPackageRepository";
import { createRolePricing } from "./rolePricingManagementService";
import { ValidationError, ConflictError } from "../../../utils/errors";

/**
 * List all token packages
 */
export async function listPackages() {
  return await findAllPackages();
}

/**
 * Create a new token package with optional role pricing
 */
export async function createPackage(
  data: {
    name: string;
    tokens: number;
    description?: string | null;
    isActive?: boolean;
    attorneyPriceInCents?: number | null;
    clientPriceInCents?: number | null;
  },
  adminId: string
) {
  // Validate required fields
  if (!data.name || !data.tokens) {
    throw new ValidationError("Name and tokens are required");
  }

  if (data.tokens <= 0) {
    throw new ValidationError("Tokens must be greater than 0");
  }

  // Create the package
  const newPackage = await createPackageRepo({
    name: data.name,
    tokens: data.tokens,
    description: data.description,
    isActive: data.isActive,
  });

  // Create role pricing entries if provided
  const rolePricingPromises: Promise<any>[] = [];

  if (
    data.attorneyPriceInCents !== null &&
    data.attorneyPriceInCents !== undefined &&
    data.attorneyPriceInCents > 0
  ) {
    rolePricingPromises.push(
      createRolePricing(
        newPackage.id,
        "ATTORNEY",
        data.attorneyPriceInCents,
        adminId,
        data.isActive ?? true
      ).catch(error => {
        // If role pricing already exists, that's okay - we'll just skip it
        if (error instanceof ConflictError) {
          return null; // Skip this one
        }
        throw error;
      })
    );
  }

  if (
    data.clientPriceInCents !== null &&
    data.clientPriceInCents !== undefined &&
    data.clientPriceInCents > 0
  ) {
    rolePricingPromises.push(
      createRolePricing(
        newPackage.id,
        "CUSTOMER",
        data.clientPriceInCents,
        adminId,
        data.isActive ?? true
      ).catch(error => {
        // If role pricing already exists, that's okay - we'll just skip it
        if (error instanceof ConflictError) {
          return null; // Skip this one
        }
        throw error;
      })
    );
  }

  // Wait for all role pricing entries to be created
  if (rolePricingPromises.length > 0) {
    await Promise.all(rolePricingPromises);
  }

  // Fetch the package again with role pricing included
  const { findPackageById } = await import(
    "../../../repositories/pricing/tokenPackageRepository"
  );
  return await findPackageById(newPackage.id);
}
