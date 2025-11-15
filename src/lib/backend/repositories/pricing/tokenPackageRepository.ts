// Repository for token package database operations

import { prisma } from "../../prisma";
import type { Role } from "@prisma/client";

export interface TokenPackageWithRolePricing {
  id: string;
  name: string;
  tokens: number;
  description: string | null;
  isActive: boolean;
  RolePricing: Array<{
    id: string;
    role: Role;
    priceInCents: number;
    isActive: boolean;
  }>;
}

/**
 * Find all active token packages with role pricing
 */
export async function findActivePackages(): Promise<TokenPackageWithRolePricing[]> {
  return await prisma.tokenPackage.findMany({
    where: {
      isActive: true,
    },
    include: {
      RolePricing: {
        where: {
          isActive: true,
        },
      },
    },
    orderBy: {
      tokens: "asc",
    },
  });
}

/**
 * Find token package by ID with role pricing
 */
export async function findPackageByIdWithRolePricing(
  packageId: string,
  role?: Role
): Promise<TokenPackageWithRolePricing | null> {
  const where: any = { id: packageId };
  const rolePricingWhere: any = role ? { role, isActive: true } : { isActive: true };

  return await prisma.tokenPackage.findUnique({
    where,
    include: {
      RolePricing: {
        where: rolePricingWhere,
      },
    },
  });
}

/**
 * Find active token packages filtered by role
 */
export async function findActivePackagesByRole(
  role: Role
): Promise<TokenPackageWithRolePricing[]> {
  return await prisma.tokenPackage.findMany({
    where: {
      isActive: true,
    },
    include: {
      RolePricing: {
        where: {
          role,
          isActive: true,
        },
      },
    },
    orderBy: {
      tokens: "asc",
    },
  });
}

/**
 * Find all token packages (admin use - includes inactive)
 */
export async function findAllPackages(): Promise<TokenPackageWithRolePricing[]> {
  return await prisma.tokenPackage.findMany({
    include: {
      RolePricing: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Find token package by ID (admin use - includes inactive)
 */
export async function findPackageById(
  id: string
): Promise<TokenPackageWithRolePricing | null> {
  return await prisma.tokenPackage.findUnique({
    where: { id },
    include: {
      RolePricing: true,
    },
  });
}

/**
 * Create a new token package (without pricing - pricing must be added separately via RolePricing)
 */
export async function createPackage(data: {
  name: string;
  tokens: number;
  description?: string | null;
  isActive?: boolean;
}): Promise<TokenPackageWithRolePricing> {
  return await prisma.tokenPackage.create({
    data: {
      name: data.name,
      tokens: data.tokens,
      description: data.description || null,
      isActive: data.isActive ?? true,
    },
    include: {
      RolePricing: true,
    },
  });
}

/**
 * Update a token package
 */
export async function updatePackage(
  id: string,
  data: {
    name?: string;
    tokens?: number;
    description?: string | null;
    isActive?: boolean;
  }
): Promise<TokenPackageWithRolePricing> {
  return await prisma.tokenPackage.update({
    where: { id },
    data,
    include: {
      RolePricing: true,
    },
  });
}

/**
 * Soft delete a token package (sets isActive to false)
 */
export async function deletePackage(id: string): Promise<void> {
  await prisma.tokenPackage.update({
    where: { id },
    data: { isActive: false },
  });
}

/**
 * Check if package has any purchases
 */
export async function hasPackagePurchases(id: string): Promise<boolean> {
  const purchase = await prisma.purchase.findFirst({
    where: { packageId: id },
  });
  return !!purchase;
}

