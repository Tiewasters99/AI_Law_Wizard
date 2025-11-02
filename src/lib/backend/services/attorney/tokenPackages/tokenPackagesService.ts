// Service for attorney token packages functionality

import { findActivePackages } from "../../../repositories/pricing/tokenPackageRepository";
import { prisma } from "../../../prisma";

/**
 * Get all active token packages
 */
export async function getTokenPackages() {
  return await findActivePackages();
}

/**
 * Create a new token package (admin/attorney function)
 */
export async function createTokenPackage(data: {
  name: string;
  tokens: number;
  priceInCents: number;
  description?: string;
}) {
  return await prisma.tokenPackage.create({
    data: {
      name: data.name,
      tokens: data.tokens,
      priceInCents: data.priceInCents,
      description: data.description,
    },
  });
}

