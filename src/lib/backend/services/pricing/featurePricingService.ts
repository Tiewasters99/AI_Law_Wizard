// Service for feature pricing functionality

import {
  findFeaturePricing,
  findAllFeaturePricing,
  findFeaturePricingById,
  createFeaturePricing as createFeaturePricingRepo,
  updateFeaturePricing as updateFeaturePricingRepo,
  deleteFeaturePricing as deleteFeaturePricingRepo,
  findFeaturePricingByFeature,
  type FeaturePricing,
} from "../../repositories/pricing/featurePricingRepository";
import { NotFoundError, ValidationError } from "../../utils/errors";
import type { Role } from "@prisma/client";

export interface FeaturePricingResponse {
  id: string;
  feature: string;
  displayName: string;
  tokens: number;
  role: Role | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get feature pricing by feature name and role
 * Priority: Role-specific pricing > Role-agnostic pricing
 * @param feature - Feature name (e.g., 'wizard', 'grand-wizard', 'document-assistant')
 * @param role - Optional role for role-specific pricing
 * @returns Token cost for the feature
 * @throws NotFoundError if pricing not found
 */
export async function getFeatureTokenCost(
  feature: string,
  role?: Role
): Promise<number> {
  if (!feature) {
    throw new ValidationError("Feature name is required");
  }

  const pricing = await findFeaturePricing(feature, role);

  if (!pricing) {
    throw new NotFoundError(
      `Feature pricing for "${feature}"${role ? ` (role: ${role})` : ""} not found`
    );
  }

  return pricing.tokens;
}

/**
 * Get feature pricing details by feature name and role
 * @param feature - Feature name
 * @param role - Optional role for role-specific pricing
 * @returns Feature pricing details
 */
export async function getFeaturePricing(
  feature: string,
  role?: Role
): Promise<FeaturePricingResponse | null> {
  if (!feature) {
    throw new ValidationError("Feature name is required");
  }

  const pricing = await findFeaturePricing(feature, role);

  if (!pricing) {
    return null;
  }

  return {
    id: pricing.id,
    feature: pricing.feature,
    displayName: pricing.displayName,
    tokens: pricing.tokens,
    role: pricing.role,
    description: pricing.description,
    isActive: pricing.isActive,
    createdAt: pricing.createdAt,
    updatedAt: pricing.updatedAt,
  };
}

/**
 * Get all feature pricing entries
 * @param role - Optional role to filter by
 * @returns Array of feature pricing entries
 */
export async function getAllFeaturePricing(
  role?: Role
): Promise<FeaturePricingResponse[]> {
  const pricingList = await findAllFeaturePricing(role);

  return pricingList.map(pricing => ({
    id: pricing.id,
    feature: pricing.feature,
    displayName: pricing.displayName,
    tokens: pricing.tokens,
    role: pricing.role,
    description: pricing.description,
    isActive: pricing.isActive,
    createdAt: pricing.createdAt,
    updatedAt: pricing.updatedAt,
  }));
}

/**
 * Get feature pricing by ID (admin use)
 */
export async function getFeaturePricingById(
  id: string
): Promise<FeaturePricingResponse> {
  if (!id) {
    throw new ValidationError("Feature pricing ID is required");
  }

  const pricing = await findFeaturePricingById(id);

  if (!pricing) {
    throw new NotFoundError("Feature pricing not found");
  }

  return {
    id: pricing.id,
    feature: pricing.feature,
    displayName: pricing.displayName,
    tokens: pricing.tokens,
    role: pricing.role,
    description: pricing.description,
    isActive: pricing.isActive,
    createdAt: pricing.createdAt,
    updatedAt: pricing.updatedAt,
  };
}

/**
 * Create feature pricing (admin use)
 */
export async function createFeaturePricing(data: {
  feature: string;
  displayName: string;
  tokens: number;
  role?: Role | null;
  description?: string | null;
  isActive?: boolean;
}): Promise<FeaturePricingResponse> {
  // Validation
  if (!data.feature) {
    throw new ValidationError("Feature name is required");
  }
  if (!data.displayName) {
    throw new ValidationError("Display name is required");
  }
  if (data.tokens === undefined || data.tokens < 0) {
    throw new ValidationError("Tokens must be a non-negative number");
  }

  const pricing = await createFeaturePricingRepo(data);

  return {
    id: pricing.id,
    feature: pricing.feature,
    displayName: pricing.displayName,
    tokens: pricing.tokens,
    role: pricing.role,
    description: pricing.description,
    isActive: pricing.isActive,
    createdAt: pricing.createdAt,
    updatedAt: pricing.updatedAt,
  };
}

/**
 * Update feature pricing (admin use)
 */
export async function updateFeaturePricing(
  id: string,
  data: {
    feature?: string;
    displayName?: string;
    tokens?: number;
    role?: Role | null;
    description?: string | null;
    isActive?: boolean;
  }
): Promise<FeaturePricingResponse> {
  if (!id) {
    throw new ValidationError("Feature pricing ID is required");
  }

  if (data.tokens !== undefined && data.tokens < 0) {
    throw new ValidationError("Tokens must be a non-negative number");
  }

  const existing = await findFeaturePricingById(id);
  if (!existing) {
    throw new NotFoundError("Feature pricing not found");
  }

  const pricing = await updateFeaturePricingRepo(id, data);

  return {
    id: pricing.id,
    feature: pricing.feature,
    displayName: pricing.displayName,
    tokens: pricing.tokens,
    role: pricing.role,
    description: pricing.description,
    isActive: pricing.isActive,
    createdAt: pricing.createdAt,
    updatedAt: pricing.updatedAt,
  };
}

/**
 * Delete feature pricing (admin use)
 */
export async function deleteFeaturePricing(id: string): Promise<void> {
  if (!id) {
    throw new ValidationError("Feature pricing ID is required");
  }

  const existing = await findFeaturePricingById(id);
  if (!existing) {
    throw new NotFoundError("Feature pricing not found");
  }

  await deleteFeaturePricingRepo(id);
}

/**
 * Get all pricing entries for a specific feature (all roles)
 */
export async function getFeaturePricingByFeature(
  feature: string
): Promise<FeaturePricingResponse[]> {
  if (!feature) {
    throw new ValidationError("Feature name is required");
  }

  const pricingList = await findFeaturePricingByFeature(feature);

  return pricingList.map(pricing => ({
    id: pricing.id,
    feature: pricing.feature,
    displayName: pricing.displayName,
    tokens: pricing.tokens,
    role: pricing.role,
    description: pricing.description,
    isActive: pricing.isActive,
    createdAt: pricing.createdAt,
    updatedAt: pricing.updatedAt,
  }));
}
