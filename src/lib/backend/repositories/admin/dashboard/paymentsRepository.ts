// Repository for admin dashboard payment statistics

import { prisma } from "../../../prisma";

export interface PaymentStats {
  totalRevenue: number;
  totalPurchases: number;
  averagePurchase: number;
}

/**
 * Get overall payment statistics from completed purchases
 */
export async function getPaymentStats(): Promise<PaymentStats> {
  const result = await prisma.purchase.aggregate({
    where: {
      status: "COMPLETED",
    },
    _sum: {
      amountPaid: true,
    },
    _count: true,
    _avg: {
      amountPaid: true,
    },
  });

  return {
    totalRevenue: result._sum.amountPaid || 0,
    totalPurchases: result._count,
    averagePurchase: Math.round(result._avg.amountPaid || 0),
  };
}
