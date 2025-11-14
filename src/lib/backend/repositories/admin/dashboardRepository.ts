// Repository for admin dashboard database operations

import { prisma } from "../../prisma";

export interface UserCounts {
  total: number;
  customers: number;
  attorneys: number;
}

export interface FeatureCounts {
  enabled: number;
  total: number;
}

export interface TokenStats {
  total: number;
  average: number;
}

export interface RevenueStats {
  amount: number | null;
  count: number;
}

/**
 * Get user counts (total, customers, attorneys)
 */
export async function getUserCounts(): Promise<UserCounts> {
  const [total, customers, attorneys] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "ATTORNEY" } }),
  ]);

  return { total, customers, attorneys };
}

/**
 * Get feature counts (enabled, total)
 */
export async function getFeatureCounts(): Promise<FeatureCounts> {
  const [enabled, total] = await Promise.all([
    prisma.feature.count({ where: { isEnabled: true } }),
    prisma.feature.count(),
  ]);

  return { enabled, total };
}

/**
 * Get token statistics (total and average)
 */
export async function getTokenStats(userCount: number): Promise<TokenStats> {
  const wallets = await prisma.wallet.findMany({
    select: { balance: true },
  });

  const total = wallets.reduce((sum, w) => sum + w.balance, 0);
  const average = userCount > 0 ? total / userCount : 0;

  return { total, average };
}

/**
 * Get revenue statistics for a date range
 */
export async function getRevenueStats(
  startDate: Date,
  endDate?: Date
): Promise<RevenueStats> {
  const where: any = {
    status: "COMPLETED",
    createdAt: { gte: startDate },
  };

  if (endDate) {
    where.createdAt.lte = endDate;
  }

  const result = await prisma.purchase.aggregate({
    where,
    _sum: { amountPaid: true },
    _count: true,
  });

  return {
    amount: result._sum.amountPaid,
    count: result._count,
  };
}

