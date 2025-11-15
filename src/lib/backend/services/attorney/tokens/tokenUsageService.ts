// Service for attorney token usage statistics functionality

import {
  getTokenTransactionsByUserId,
  aggregateTokenTransactions,
} from "../../../repositories/attorney/tokenTransactionRepository";

/**
 * Get token usage statistics for an attorney
 */
export async function getTokenUsageStats(attorneyId: string) {
  // Get total purchased
  const totalPurchased = await aggregateTokenTransactions(attorneyId, "PURCHASE");

  // Get total consumed
  const totalConsumed = await aggregateTokenTransactions(
    attorneyId,
    "CONSUMPTION"
  );

  const totalUsed = Math.abs(totalConsumed || 0);

  // Get all consumption transactions for feature breakdown
  const transactions = await getTokenTransactionsByUserId(attorneyId);

  // Aggregate by feature using the feature field
  const featureUsage: Record<string, { tokens: number; count: number }> = {};
  transactions
    .filter(tx => tx.type === "CONSUMPTION")
    .forEach(transaction => {
      const feature = transaction.feature || "Other";
      if (!featureUsage[feature]) {
        featureUsage[feature] = { tokens: 0, count: 0 };
      }
      featureUsage[feature].tokens += Math.abs(transaction.amount);
      featureUsage[feature].count += 1;
    });

  // Convert to array with percentages
  const breakdown = Object.entries(featureUsage).map(([feature, data]) => ({
    feature,
    tokens: data.tokens,
    count: data.count,
    percentage: totalUsed > 0 ? Math.round((data.tokens / totalUsed) * 100) : 0,
  }));

  // Sort by tokens descending
  breakdown.sort((a, b) => b.tokens - a.tokens);

  return {
    totalPurchased: totalPurchased || 0,
    totalUsed,
    breakdown,
  };
}


