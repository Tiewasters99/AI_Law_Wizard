// Service for admin dashboard feature-wise spending

import { getFeatureSpending } from "../../../repositories/admin/dashboard/featureSpendingRepository";

/**
 * Get feature-wise spending statistics
 */
export async function getFeatureSpendingStats() {
  const spending = await getFeatureSpending();
  
  // Calculate total for percentage calculation
  const totalTokens = spending.reduce((sum, item) => sum + item.totalTokens, 0);

  // Add percentage to each feature
  return spending.map((item) => ({
    ...item,
    percentage: totalTokens > 0 ? Math.round((item.totalTokens / totalTokens) * 100) : 0,
  }));
}

