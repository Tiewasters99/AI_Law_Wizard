// Service for Stripe payment operations

import { stripe } from "../../../stripeServer";
import { findPackageByIdWithRolePricing } from "../../../repositories/pricing/tokenPackageRepository";
import { createPurchase } from "../../../repositories/attorney/purchaseRepository";
import { NotFoundError, ValidationError } from "../../../utils/errors";
import type { Role } from "@prisma/client";

/**
 * Create payment intent for token package purchase
 */
export async function createPaymentIntent(
  userId: string,
  packageId: string,
  role: Role
) {
  // Get the token package with role-specific pricing
  const tokenPackage = await findPackageByIdWithRolePricing(packageId, role);

  if (!tokenPackage || !tokenPackage.isActive) {
    throw new NotFoundError("Invalid or inactive package");
  }

  // Get role-specific price, fallback to base price if role pricing not found
  const rolePricing = tokenPackage.RolePricing.find(
    (rp) => rp.role === role && rp.isActive
  );
  const priceInCents = rolePricing
    ? rolePricing.priceInCents
    : tokenPackage.priceInCents;

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: priceInCents,
    currency: "usd",
    metadata: {
      userId,
      packageId: tokenPackage.id,
      tokens: tokenPackage.tokens.toString(),
      role: role,
    },
    description: `${tokenPackage.name} - ${tokenPackage.tokens} tokens`,
  });

  // Create purchase record
  await createPurchase({
    userId,
    packageId: tokenPackage.id,
    stripePaymentIntent: paymentIntent.id,
    tokensAwarded: tokenPackage.tokens,
    amountPaid: priceInCents,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

