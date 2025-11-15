// Repository for purchase database operations

import { prisma } from "../../prisma";

export interface Purchase {
  id: string;
  userId: string;
  packageId: string;
  stripePaymentIntent: string;
  status: string;
  tokensAwarded: number;
  amountPaid: number;
  metadata: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePurchaseData {
  userId: string;
  packageId: string;
  stripePaymentIntent: string;
  tokensAwarded: number;
  amountPaid: number;
}

/**
 * Create a new purchase record
 */
export async function createPurchase(
  data: CreatePurchaseData
): Promise<Purchase> {
  return await prisma.purchase.create({
    data: {
      userId: data.userId,
      packageId: data.packageId,
      stripePaymentIntent: data.stripePaymentIntent,
      tokensAwarded: data.tokensAwarded,
      amountPaid: data.amountPaid,
      status: "PENDING",
    },
  });
}
