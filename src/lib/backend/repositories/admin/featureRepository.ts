// Repository for feature database operations

import { prisma } from "../../prisma";

export interface FeatureWithRoles {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  route: string;
  category: string;
  isGlobal: boolean;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  roleSpecific: {
    id: string;
    role: string;
    isEnabled: boolean;
  }[];
}

/**
 * Find all features with role-specific settings
 */
export async function findAllFeatures(): Promise<FeatureWithRoles[]> {
  return await prisma.feature.findMany({
    include: {
      roleSpecific: true,
    },
    orderBy: [{ category: "asc" }, { displayName: "asc" }],
  });
}

/**
 * Find feature by ID with role-specific settings
 */
export async function findFeatureById(
  id: string
): Promise<FeatureWithRoles | null> {
  return await prisma.feature.findUnique({
    where: { id },
    include: {
      roleSpecific: true,
    },
  });
}

/**
 * Find feature by name with role-specific settings
 */
export async function findFeatureByName(
  name: string
): Promise<FeatureWithRoles | null> {
  return await prisma.feature.findUnique({
    where: { name },
    include: {
      roleSpecific: true,
    },
  });
}

/**
 * Update feature global enabled state
 */
export async function updateFeatureEnabled(
  id: string,
  isEnabled: boolean
): Promise<FeatureWithRoles> {
  return await prisma.feature.update({
    where: { id },
    data: { isEnabled },
    include: {
      roleSpecific: true,
    },
  });
}

/**
 * Upsert feature role-specific enabled state
 */
export async function upsertFeatureRole(
  featureId: string,
  role: "ATTORNEY" | "CUSTOMER",
  isEnabled: boolean
): Promise<void> {
  await prisma.featureRole.upsert({
    where: {
      featureId_role: {
        featureId,
        role,
      },
    },
    update: { isEnabled },
    create: {
      featureId,
      role,
      isEnabled,
    },
  });
}
