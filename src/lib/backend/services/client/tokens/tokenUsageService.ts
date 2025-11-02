// Service for client token usage statistics functionality

import {
  getTokenTransactionsByUserId,
  aggregateTokenTransactions,
} from "../../../repositories/attorney/tokenTransactionRepository";

/**
 * Get token usage statistics for a client
 */
export async function getTokenUsageStats(clientId: string) {
  // Get total purchased
  const totalPurchased = await aggregateTokenTransactions(clientId, "PURCHASE");

  // Get total consumed
  const totalConsumed = await aggregateTokenTransactions(
    clientId,
    "CONSUMPTION"
  );

  const totalUsed = Math.abs(totalConsumed || 0);

  // Get all consumption transactions for feature breakdown
  const transactions = await getTokenTransactionsByUserId(clientId);

  // Aggregate by feature
  const featureUsage: Record<string, number> = {};
  transactions
    .filter(tx => tx.type === "CONSUMPTION")
    .forEach(transaction => {
      const metadata = transaction.metadata as any;
      const feature = metadata?.feature || "Other";
      featureUsage[feature] =
        (featureUsage[feature] || 0) + Math.abs(transaction.amount);
    });

  // Convert to array with percentages
  const breakdown = Object.entries(featureUsage).map(([feature, tokens]) => ({
    feature,
    tokens,
    percentage: totalUsed > 0 ? Math.round((tokens / totalUsed) * 100) : 0,
  }));

  return {
    totalPurchased: totalPurchased || 0,
    totalUsed,
    breakdown,
  };
}

