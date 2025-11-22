// Repository for role pricing database operations

import { prisma } from "../../prisma";

export interface RolePricingWithPackage {
  id: string;
  role: string;
  packageId: string;
  priceInCents: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  package: {
    id: string;
    name: string;
    tokens: number;
  };
}

/**
 * Find role pricing by ID with package
 */
export async function findRolePricingById(
  id: string
): Promise<RolePricingWithPackage | null> {
  return await prisma.rolePricing.findUnique({
    where: { id },
    include: {
      package: {
        select: {
          id: true,
          name: true,
          tokens: true,
        },
      },
    },
  });
}

/**
 * Find role pricing for a package and role
 */
export async function findRolePricingByPackageAndRole(
  packageId: string,
  role: "ATTORNEY" | "CUSTOMER"
): Promise<RolePricingWithPackage | null> {
  const rolePricing = await prisma.rolePricing.findUnique({
    where: {
      role_packageId: {
        role,
        packageId,
      },
    },
    include: {
      package: {
        select: {
          id: true,
          name: true,
          tokens: true,
        },
      },
    },
  });

  return rolePricing;
}

/**
 * Create role pricing
 */
export async function createRolePricing(
  packageId: string,
  role: "ATTORNEY" | "CUSTOMER",
  priceInCents: number,
  isActive: boolean = true
): Promise<RolePricingWithPackage> {
  return await prisma.rolePricing.create({
    data: {
      packageId,
      role,
      priceInCents,
      isActive,
    },
    include: {
      package: {
        select: {
          id: true,
          name: true,
          tokens: true,
        },
      },
    },
  });
}

/**
 * Update role pricing
 */
export async function updateRolePricing(
  id: string,
  priceInCents: number
): Promise<RolePricingWithPackage> {
  return await prisma.rolePricing.update({
    where: { id },
    data: { priceInCents },
    include: {
      package: {
        select: {
          id: true,
          name: true,
          tokens: true,
        },
      },
    },
  });
}

/**
 * Delete role pricing
 */
export async function deleteRolePricing(
  id: string
): Promise<RolePricingWithPackage> {
  return await prisma.rolePricing.delete({
    where: { id },
    include: {
      package: {
        select: {
          id: true,
          name: true,
          tokens: true,
        },
      },
    },
  });
}
