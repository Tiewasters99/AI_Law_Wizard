// Service for Stripe payment operations

import { stripe } from "../../../stripeServer";
import { findPackageByIdWithRolePricing } from "../../../repositories/pricing/tokenPackageRepository";
import { createPurchase } from "../../../repositories/attorney/purchaseRepository";
import { NotFoundError } from "../../../utils/errors";

/**
 * Create payment intent for token package purchase
 */
export async function createPaymentIntent(
  userId: string,
  packageId: string
) {
  // Get the token package
  const tokenPackage = await findPackageByIdWithRolePricing(packageId);

  if (!tokenPackage || !tokenPackage.isActive) {
    throw new NotFoundError("Invalid or inactive package");
  }

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: tokenPackage.priceInCents,
    currency: "usd",
    metadata: {
      userId,
      packageId: tokenPackage.id,
      tokens: tokenPackage.tokens.toString(),
    },
    description: `${tokenPackage.name} - ${tokenPackage.tokens} tokens`,
  });

  // Create purchase record
  await createPurchase({
    userId,
    packageId: tokenPackage.id,
    stripePaymentIntent: paymentIntent.id,
    tokensAwarded: tokenPackage.tokens,
    amountPaid: tokenPackage.priceInCents,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

