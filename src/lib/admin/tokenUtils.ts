import { prisma } from "../backend/prisma";
import { TokenStats, UserTokenSummary, TrendData } from "@/types/admin";

export async function calculateTokenStats(userId: string): Promise<TokenStats> {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    return {
      balance: 0,
      totalPurchased: 0,
      totalConsumed: 0,
      purchaseCount: 0,
      lastPurchaseDate: null,
    };
  }

  // Get purchase transactions
  const purchases = await prisma.tokenTransaction.findMany({
    where: {
      userId,
      type: "PURCHASE",
    },
  });

  // Get consumption transactions
  const consumptions = await prisma.tokenTransaction.findMany({
    where: {
      userId,
      type: "CONSUMPTION",
    },
  });

  const totalPurchased = purchases.reduce((sum, t) => sum + t.amount, 0);
  const totalConsumed = consumptions.reduce((sum, t) => sum + t.amount, 0);
  const lastPurchaseDate =
    purchases.length > 0
      ? purchases.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )[0].createdAt
      : null;

  return {
    balance: wallet.balance,
    totalPurchased,
    totalConsumed,
    purchaseCount: purchases.length,
    lastPurchaseDate,
  };
}

export function formatTokenAmount(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount);
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export async function exportTokenHistory(userId: string): Promise<Blob> {
  const transactions = await prisma.tokenTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const csvData = [
    ["Date", "Type", "Amount", "Description", "Reference"],
    ...transactions.map(t => [
      t.createdAt.toISOString(),
      t.type,
      t.amount.toString(),
      t.description,
      t.reference || "",
    ]),
  ];

  const csvContent = csvData.map(row => row.join(",")).join("\n");
  return new Blob([csvContent], { type: "text/csv" });
}

export async function getTopTokenConsumers(
  limit: number = 10
): Promise<UserTokenSummary[]> {
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ["ATTORNEY", "CUSTOMER"],
      },
    },
    include: {
      wallet: true,
      tokenTransactions: {
        where: {
          type: "CONSUMPTION",
        },
      },
    },
  });

  const consumers = users
    .map(user => {
      const tokensConsumed = user.tokenTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
      );
      return {
        userId: user.id,
        userName: user.name || user.email || "",
        userRole: user.role as "ATTORNEY" | "CUSTOMER",
        tokensConsumed,
        percentageOfTotal: 0, // Will be calculated after sorting
      };
    })
    .filter(user => user.tokensConsumed > 0)
    .sort((a, b) => b.tokensConsumed - a.tokensConsumed)
    .slice(0, limit);

  // Calculate percentages
  const totalConsumed = consumers.reduce(
    (sum, user) => sum + user.tokensConsumed,
    0
  );
  consumers.forEach(user => {
    user.percentageOfTotal =
      totalConsumed > 0 ? (user.tokensConsumed / totalConsumed) * 100 : 0;
  });

  return consumers;
}

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
      data.consumed += transaction.amount;
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

export async function adjustUserTokens(
  userId: string,
  amount: number,
  reason: string,
  adminId: string
): Promise<void> {
  await prisma.$transaction(async tx => {
    // Update wallet
    const wallet = await tx.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    await tx.wallet.update({
      where: { userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    // Create transaction record
    await tx.tokenTransaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: "ADMIN_ADJUSTMENT",
        amount: Math.abs(amount),
        description: `Admin adjustment: ${reason}`,
        reference: `ADMIN_${adminId}`,
      },
    });
  });
}
