// Repository for admin dashboard feature-wise spending

import { prisma } from "../../../prisma";

export interface FeatureSpending {
  feature: string;
  totalTokens: number;
}

/**
 * Get feature-wise token consumption statistics
 */
export async function getFeatureSpending(): Promise<FeatureSpending[]> {
  const transactions = await prisma.tokenTransaction.findMany({
    where: {
      type: "CONSUMPTION",
    },
    select: {
      feature: true,
      amount: true,
    },
  });

  // Group by feature and sum tokens (amount is negative for consumption, so we use absolute value)
  const featureMap = new Map<string, number>();

  transactions.forEach(transaction => {
    const feature = transaction.feature || "Unspecified";
    const tokens = Math.abs(transaction.amount);
    featureMap.set(feature, (featureMap.get(feature) || 0) + tokens);
  });

  // Convert to array and sort by total tokens descending
  const result: FeatureSpending[] = Array.from(featureMap.entries())
    .map(([feature, totalTokens]) => ({
      feature,
      totalTokens,
    }))
    .sort((a, b) => b.totalTokens - a.totalTokens);

  return result;
}
