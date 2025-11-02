import { prisma } from "./prisma";

export interface TokenTransaction {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  type: "PURCHASE" | "CONSUMPTION" | "REFUND" | "ADMIN_ADJUSTMENT";
  description: string | null;
  reference: string | null;
  metadata: any;
  createdAt: Date;
}

export interface TokenBalance {
  balance: number;
  transactions: TokenTransaction[];
}

/**
 * Get current token balance for a user
 */
export async function getTokenBalance(userId: string): Promise<number> {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { balance: true },
    });

    return wallet?.balance || 0;
  } catch (error) {
    console.error("Error getting token balance:", error);
    return 0;
  }
}

/**
 * Check if user has sufficient token balance
 */
export async function checkTokenBalance(
  userId: string,
  requiredAmount: number
): Promise<boolean> {
  const balance = await getTokenBalance(userId);
  return balance >= requiredAmount;
}

/**
 * Deduct tokens from user balance
 */
export async function deductTokens(
  userId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    // Check if user has sufficient balance
    const hasBalance = await checkTokenBalance(userId, amount);
    if (!hasBalance) {
      return {
        success: false,
        newBalance: await getTokenBalance(userId),
        error: "Insufficient token balance",
      };
    }

    // Start transaction
    const result = await prisma.$transaction(async tx => {
      // Get or create wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId, balance: 0 },
        });
      }

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
        select: { balance: true },
      });

      // Create transaction record
      await tx.tokenTransaction.create({
        data: {
          walletId: wallet.id,
          userId,
          amount: -amount, // Negative for consumption
          type: "CONSUMPTION",
          description: reason,
        },
      });

      return updatedWallet.balance;
    });

    return {
      success: true,
      newBalance: result,
    };
  } catch (error) {
    console.error("Error deducting tokens:", error);
    return {
      success: false,
      newBalance: await getTokenBalance(userId),
      error: "Failed to deduct tokens",
    };
  }
}

/**
 * Add tokens to user balance
 */
export async function addTokens(
  userId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    const result = await prisma.$transaction(async tx => {
      // Get or create wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId, balance: 0 },
        });
      }

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: amount,
          },
        },
        select: { balance: true },
      });

      // Create transaction record
      await tx.tokenTransaction.create({
        data: {
          walletId: wallet.id,
          userId,
          amount, // Positive for purchase
          type: "PURCHASE",
          description: reason,
        },
      });

      return updatedWallet.balance;
    });

    return {
      success: true,
      newBalance: result,
    };
  } catch (error) {
    console.error("Error adding tokens:", error);
    return {
      success: false,
      newBalance: await getTokenBalance(userId),
      error: "Failed to add tokens",
    };
  }
}

/**
 * Get token transaction history
 */
export async function getTokenTransactions(
  userId: string,
  limit: number = 50
): Promise<TokenTransaction[]> {
  try {
    const transactions = await prisma.tokenTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return transactions.map(tx => ({
      id: tx.id,
      userId: tx.userId,
      walletId: tx.walletId,
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
      reference: tx.reference,
      metadata: tx.metadata,
      createdAt: tx.createdAt,
    }));
  } catch (error) {
    console.error("Error getting token transactions:", error);
    return [];
  }
}

/**
 * Get token usage summary
 */
export async function getTokenUsageSummary(userId: string): Promise<{
  balance: number;
  totalUsed: number;
  totalPurchased: number;
  recentTransactions: TokenTransaction[];
}> {
  try {
    const [balance, transactions] = await Promise.all([
      getTokenBalance(userId),
      getTokenTransactions(userId, 10),
    ]);

    const totalUsed = transactions
      .filter(t => t.type === "CONSUMPTION")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalPurchased = transactions
      .filter(t => t.type === "PURCHASE")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      balance,
      totalUsed,
      totalPurchased,
      recentTransactions: transactions,
    };
  } catch (error) {
    console.error("Error getting token usage summary:", error);
    return {
      balance: 0,
      totalUsed: 0,
      totalPurchased: 0,
      recentTransactions: [],
    };
  }
}
