// Service for admin dashboard statistics

import {
  getUserCounts,
  getFeatureCounts,
  getTokenStats,
  getRevenueStats,
} from "../../../repositories/admin/dashboardRepository";
import { getTopTokenConsumers } from "./dashboardTopConsumersService";
import { getConsumptionTrends } from "./dashboardTokenUsageService";

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  // Get user counts
  const userCounts = await getUserCounts();

  // Get feature counts
  const featureCounts = await getFeatureCounts();

  // Get token statistics
  const tokenStats = await getTokenStats(userCounts.total);

  // Calculate revenue for this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const thisMonthRevenue = await getRevenueStats(startOfMonth);

  // Calculate revenue for last month
  const startOfLastMonth = new Date();
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
  startOfLastMonth.setDate(1);
  startOfLastMonth.setHours(0, 0, 0, 0);

  const endOfLastMonth = new Date();
  endOfLastMonth.setDate(0);
  endOfLastMonth.setHours(23, 59, 59, 999);

  const lastMonthRevenue = await getRevenueStats(
    startOfLastMonth,
    endOfLastMonth
  );

  // Calculate percentage changes (mock data for user and feature changes)
  const userChange = 5; // Mock: 5% increase
  const featureChange = 0; // Mock: no change
  const tokenChange = 12; // Mock: 12% increase
  const revenueChange = lastMonthRevenue.amount
    ? Math.round(
        (((thisMonthRevenue.amount || 0) - lastMonthRevenue.amount) /
          lastMonthRevenue.amount) *
          100
      )
    : 0;

  // Get additional data
  const topConsumers = await getTopTokenConsumers(10);
  const trends = await getConsumptionTrends(30);

  return {
    users: {
      total: userCounts.total,
      customers: userCounts.customers,
      attorneys: userCounts.attorneys,
      change: userChange,
    },
    features: {
      enabled: featureCounts.enabled,
      total: featureCounts.total,
      change: featureChange,
    },
    tokens: {
      total: tokenStats.total,
      average: Math.round(tokenStats.average),
      change: tokenChange,
    },
    revenue: {
      amount: thisMonthRevenue.amount || 0,
      count: thisMonthRevenue.count,
      change: revenueChange,
    },
    topConsumers,
    trends,
  };
}
