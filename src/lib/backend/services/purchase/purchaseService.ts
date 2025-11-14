// Service for purchase functionality

import { findPackageByIdWithRolePricing } from "../../repositories/pricing/tokenPackageRepository";
import { findUserByEmailWithWallet } from "../../repositories/common/userRepository";
import { findOrCreateWallet } from "../../repositories/purchase/walletRepository";
import { NotFoundError, ValidationError } from "../../utils/errors";
import type { Role } from "@prisma/client";

export interface PurchaseRequest {
  packageId: string;
  role: Role;
  userEmail: string;
}

export interface PurchaseResponse {
  success: boolean;
  purchase: {
    packageId: string;
    packageName: string;
    tokens: number;
    priceInCents: number;
    role: Role;
    userId: string;
    walletId: string;
  };
  message: string;
}

/**
 * Prepare purchase for a token package
 */
export async function preparePurchase(
  request: PurchaseRequest
): Promise<PurchaseResponse> {
  // Get the package with role-specific pricing
  const packageData = await findPackageByIdWithRolePricing(
    request.packageId,
    request.role
  );

  if (!packageData) {
    throw new NotFoundError("Package");
  }

  if (!packageData.isActive) {
    throw new ValidationError("Package is not available");
  }

  // Get role-specific price
  const rolePricing = packageData.RolePricing[0];
  const priceInCents = rolePricing
    ? rolePricing.priceInCents
    : packageData.priceInCents;

  // Get user's wallet
  const user = await findUserByEmailWithWallet(request.userEmail);

  if (!user) {
    throw new NotFoundError("User");
  }

  // Find or create wallet
  const wallet = await findOrCreateWallet(user.id);

  return {
    success: true,
    purchase: {
      packageId: packageData.id,
      packageName: packageData.name,
      tokens: packageData.tokens,
      priceInCents,
      role: request.role,
      userId: user.id,
      walletId: wallet.id,
    },
    message:
      "Purchase information prepared. Stripe integration needed for payment processing.",
  };
}
