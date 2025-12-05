// Service for admin dashboard token usage trends

import { prisma } from "../../../prisma";
import { TrendData } from "@/types/admin";

/**
 * Get consumption trends for a number of days
 */
export async function getConsumptionTrends(
  days: number = 30
): Promise<TrendData[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const transactions = await prisma.tokenTransaction.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      type: true,
      amount: true,
      createdAt: true,
    },
  });

  // Group by date
  const dailyData = new Map<string, { consumed: number; purchased: number }>();

  transactions.forEach(transaction => {
    const date = transaction.createdAt.toISOString().split("T")[0];
    if (!dailyData.has(date)) {
      dailyData.set(date, { consumed: 0, purchased: 0 });
    }

    const data = dailyData.get(date)!;
    if (transaction.type === "CONSUMPTION") {
      data.consumed += Math.abs(transaction.amount);
    } else if (transaction.type === "PURCHASE") {
      data.purchased += transaction.amount;
    }
  });

  // Convert to array and fill missing dates
  const result: TrendData[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const data = dailyData.get(dateStr) || { consumed: 0, purchased: 0 };
    result.unshift({
      date: dateStr,
      consumed: data.consumed,
      purchased: data.purchased,
    });
  }

  return result;
}
