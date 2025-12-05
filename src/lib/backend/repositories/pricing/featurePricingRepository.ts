// Repository for feature pricing database operations

import { prisma } from "../../prisma";
import type { Role } from "@prisma/client";

export interface FeaturePricing {
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
 * Find feature pricing by feature name and role
 * Priority: Role-specific pricing > Role-agnostic pricing (role = null)
 */
export async function findFeaturePricing(
  feature: string,
  role?: Role
): Promise<FeaturePricing | null> {
  // First try to find role-specific pricing if role is provided
  if (role) {
    const roleSpecific = await prisma.featurePricing.findFirst({
      where: {
        feature,
        role,
        isActive: true,
      },
    });

    if (roleSpecific) {
      return roleSpecific;
    }
  }

  // Fallback to role-agnostic pricing (role = null)
  return await prisma.featurePricing.findFirst({
    where: {
      feature,
      role: null,
      isActive: true,
    },
  });
}

/**
 * Find all active feature pricing entries
 */
export async function findAllFeaturePricing(
  role?: Role
): Promise<FeaturePricing[]> {
  const where: any = {
    isActive: true,
  };

  // If role is specified, return both role-specific and role-agnostic
  if (role) {
    return await prisma.featurePricing.findMany({
      where: {
        isActive: true,
        OR: [{ role }, { role: null }],
      },
      orderBy: [{ feature: "asc" }, { role: "asc" }],
    });
  }

  return await prisma.featurePricing.findMany({
    where,
    orderBy: [{ feature: "asc" }, { role: "asc" }],
  });
}

/**
 * Find feature pricing by ID
 */
export async function findFeaturePricingById(
  id: string
): Promise<FeaturePricing | null> {
  return await prisma.featurePricing.findUnique({
    where: { id },
  });
}

/**
 * Create a new feature pricing entry
 */
export async function createFeaturePricing(data: {
  feature: string;
  displayName: string;
  tokens: number;
  role?: Role | null;
  description?: string | null;
  isActive?: boolean;
}): Promise<FeaturePricing> {
  return await prisma.featurePricing.create({
    data: {
      feature: data.feature,
      displayName: data.displayName,
      tokens: data.tokens,
      role: data.role ?? null,
      description: data.description ?? null,
      isActive: data.isActive ?? true,
    },
  });
}

/**
 * Update a feature pricing entry
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
): Promise<FeaturePricing> {
  return await prisma.featurePricing.update({
    where: { id },
    data: {
      ...(data.feature !== undefined && { feature: data.feature }),
      ...(data.displayName !== undefined && { displayName: data.displayName }),
      ...(data.tokens !== undefined && { tokens: data.tokens }),
      ...(data.role !== undefined && { role: data.role ?? null }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

/**
 * Delete a feature pricing entry
 */
export async function deleteFeaturePricing(id: string): Promise<void> {
  await prisma.featurePricing.delete({
    where: { id },
  });
}

/**
 * Find feature pricing by feature name (all roles)
 */
export async function findFeaturePricingByFeature(
  feature: string
): Promise<FeaturePricing[]> {
  return await prisma.featurePricing.findMany({
    where: {
      feature,
      isActive: true,
    },
    orderBy: {
      role: "asc",
    },
  });
}
