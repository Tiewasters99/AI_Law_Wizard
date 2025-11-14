// Repository for token transaction database operations

import { prisma } from "../../prisma";

export interface TokenTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: string;
  amount: number;
  feature: string | null;
  description: string | null;
  reference: string | null;
  metadata: any;
  createdAt: Date;
}

export interface CreateTokenTransactionData {
  walletId: string;
  userId: string;
  type: string;
  amount: number;
  description?: string;
}

/**
 * Create a new token transaction
 */
export async function createTokenTransaction(
  data: CreateTokenTransactionData
): Promise<TokenTransaction> {
  return await prisma.tokenTransaction.create({
    data: {
      walletId: data.walletId,
      userId: data.userId,
      type: data.type as
        | "PURCHASE"
        | "CONSUMPTION"
        | "REFUND"
        | "ADMIN_ADJUSTMENT",
      amount: -data.amount, // Negative for consumption
      description: data.description || "Token consumption",
    },
  });
}

/**
 * Get token transactions by user ID
 */
export async function getTokenTransactionsByUserId(
  userId: string,
  options?: { limit?: number }
): Promise<TokenTransaction[]> {
  const transactions = await prisma.tokenTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: options?.limit,
  });

  return transactions.map(tx => ({
    id: tx.id,
    walletId: tx.walletId,
    userId: tx.userId,
    type: tx.type,
    amount: tx.amount,
    feature: tx.feature,
    description: tx.description,
    reference: tx.reference,
    metadata: tx.metadata,
    createdAt: tx.createdAt,
  }));
}

/**
 * Aggregate token transactions by type
 */
export async function aggregateTokenTransactions(
  userId: string,
  type: "PURCHASE" | "CONSUMPTION"
): Promise<number | null> {
  const result = await prisma.tokenTransaction.aggregate({
    where: {
      userId,
      type,
    },
    _sum: {
      amount: true,
    },
  });

  return result._sum.amount;
}
