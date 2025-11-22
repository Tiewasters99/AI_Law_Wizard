import { prisma } from "./prisma";

export interface TokenTransaction {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  type: "PURCHASE" | "CONSUMPTION" | "REFUND" | "ADMIN_ADJUSTMENT" | "CONSULTATION_REQUEST" | "PROPOSAL_ACCEPTANCE" | "MILESTONE_COMPLETION" | "PROJECT_COMPLETION";
  feature: string | null;
  description: string | null;
  reference: string | null;
  projectId?: string | null;
  milestoneId?: string | null;
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
 * @param trackOnly - If true, only track the transaction without deducting from balance (useful for attorneys)
 * @param projectId - Optional project ID for tracking
 * @param milestoneId - Optional milestone ID for tracking
 */
export async function deductTokens(
  userId: string,
  amount: number,
  reason: string,
  feature?: string,
  metadata?: Record<string, any>,
  trackOnly: boolean = false,
  projectId?: string,
  milestoneId?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    // Check if user has sufficient balance (unless tracking only)
    if (!trackOnly) {
      const hasBalance = await checkTokenBalance(userId, amount);
      if (!hasBalance) {
        return {
          success: false,
          newBalance: await getTokenBalance(userId),
          error: "Insufficient token balance",
        };
      }
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

      // Update wallet balance only if not tracking only
      let updatedBalance = wallet.balance;
      if (!trackOnly) {
        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              decrement: amount,
            },
          },
          select: { balance: true },
        });
        updatedBalance = updatedWallet.balance;
      }

      // Determine transaction type based on feature or metadata
      let transactionType: "CONSUMPTION" | "CONSULTATION_REQUEST" | "MILESTONE_COMPLETION" | "PROJECT_COMPLETION" = "CONSUMPTION";
      if (feature === "consultation-request") {
        transactionType = "CONSULTATION_REQUEST";
      } else if (milestoneId) {
        transactionType = "MILESTONE_COMPLETION";
      } else if (projectId && !milestoneId) {
        transactionType = "PROJECT_COMPLETION";
      }

      // Always create transaction record for tracking
      await tx.tokenTransaction.create({
        data: {
          walletId: wallet.id,
          userId,
          amount: -amount, // Negative for consumption
          type: transactionType,
          feature: feature || null,
          description: reason,
          metadata: metadata ?? undefined,
          projectId: projectId || null,
          milestoneId: milestoneId || null,
        },
      });

      return updatedBalance;
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
 * @param projectId - Optional project ID for tracking
 * @param milestoneId - Optional milestone ID for tracking
 */
export async function addTokens(
  userId: string,
  amount: number,
  reason: string,
  feature?: string,
  metadata?: Record<string, any>,
  projectId?: string,
  milestoneId?: string
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

      // Determine transaction type
      let transactionType: "PURCHASE" | "MILESTONE_COMPLETION" | "PROJECT_COMPLETION" = "PURCHASE";
      if (milestoneId) {
        transactionType = "MILESTONE_COMPLETION";
      } else if (projectId && !milestoneId) {
        transactionType = "PROJECT_COMPLETION";
      }

      // Create transaction record
      await tx.tokenTransaction.create({
        data: {
          walletId: wallet.id,
          userId,
          amount, // Positive for addition
          type: transactionType,
          feature: feature || null,
          description: reason,
          metadata: metadata ?? undefined,
          projectId: projectId || null,
          milestoneId: milestoneId || null,
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
      type: tx.type as TokenTransaction["type"],
      feature: tx.feature,
      description: tx.description,
      reference: tx.reference,
      projectId: tx.projectId || undefined,
      milestoneId: tx.milestoneId || undefined,
      metadata: tx.metadata,
      createdAt: tx.createdAt,
    }));
  } catch (error) {
    console.error("Error getting token transactions:", error);
    return [];
  }
}

/**
 * Transfer tokens from one user to another (for milestone/project payments)
 * @param fromUserId - User ID to deduct tokens from
 * @param toUserId - User ID to add tokens to
 * @param amount - Amount of tokens to transfer
 * @param description - Description of the transfer
 * @param projectId - Optional project ID for tracking
 * @param milestoneId - Optional milestone ID for tracking
 */
export async function transferTokens(
  fromUserId: string,
  toUserId: string,
  amount: number,
  description: string,
  projectId?: string,
  milestoneId?: string
): Promise<{ success: boolean; fromBalance: number; toBalance: number; error?: string }> {
  try {
    // Check if from user has sufficient balance
    const hasBalance = await checkTokenBalance(fromUserId, amount);
    if (!hasBalance) {
      return {
        success: false,
        fromBalance: await getTokenBalance(fromUserId),
        toBalance: await getTokenBalance(toUserId),
        error: "Insufficient token balance",
      };
    }

    // Perform transfer in a transaction
    const result = await prisma.$transaction(async tx => {
      // Get or create wallets
      let fromWallet = await tx.wallet.findUnique({
        where: { userId: fromUserId },
      });
      let toWallet = await tx.wallet.findUnique({
        where: { userId: toUserId },
      });

      if (!fromWallet) {
        fromWallet = await tx.wallet.create({
          data: { userId: fromUserId, balance: 0 },
        });
      }
      if (!toWallet) {
        toWallet = await tx.wallet.create({
          data: { userId: toUserId, balance: 0 },
        });
      }

      // Deduct from sender
      const updatedFromWallet = await tx.wallet.update({
        where: { id: fromWallet.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
        select: { balance: true },
      });

      // Add to receiver
      const updatedToWallet = await tx.wallet.update({
        where: { id: toWallet.id },
        data: {
          balance: {
            increment: amount,
          },
        },
        select: { balance: true },
      });

      // Create transaction records for both users
      const transactionType = milestoneId ? "MILESTONE_COMPLETION" : "PROJECT_COMPLETION";

      // Deduction transaction for sender
      await tx.tokenTransaction.create({
        data: {
          walletId: fromWallet.id,
          userId: fromUserId,
          amount: -amount,
          type: transactionType,
          description: `${description} (transferred to user)`,
          projectId: projectId || null,
          milestoneId: milestoneId || null,
        },
      });

      // Addition transaction for receiver
      await tx.tokenTransaction.create({
        data: {
          walletId: toWallet.id,
          userId: toUserId,
          amount,
          type: transactionType,
          description: `${description} (received from user)`,
          projectId: projectId || null,
          milestoneId: milestoneId || null,
        },
      });

      return {
        fromBalance: updatedFromWallet.balance,
        toBalance: updatedToWallet.balance,
      };
    });

    return {
      success: true,
      fromBalance: result.fromBalance,
      toBalance: result.toBalance,
    };
  } catch (error) {
    console.error("Error transferring tokens:", error);
    return {
      success: false,
      fromBalance: await getTokenBalance(fromUserId),
      toBalance: await getTokenBalance(toUserId),
      error: "Failed to transfer tokens",
    };
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
      .filter(t => t.type === "CONSUMPTION" || t.type === "CONSULTATION_REQUEST" || t.type === "MILESTONE_COMPLETION" || t.type === "PROJECT_COMPLETION")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalPurchased = transactions
      .filter(t => t.type === "PURCHASE" || t.type === "MILESTONE_COMPLETION" || t.type === "PROJECT_COMPLETION")
      .filter(t => t.amount > 0) // Only count positive amounts
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
