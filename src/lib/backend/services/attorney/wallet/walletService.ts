// Service for attorney wallet functionality

import { findOrCreateWallet, findWalletByUserId } from "../../../repositories/purchase/walletRepository";
import { createTokenTransaction } from "../../../repositories/attorney/tokenTransactionRepository";
import { prisma } from "../../../prisma";
import { NotFoundError, ValidationError } from "../../../utils/errors";

/**
 * Get wallet for a user
 */
export async function getWallet(userId: string) {
  let wallet = await findWalletByUserId(userId);

  // Create wallet if it doesn't exist
  if (!wallet) {
    wallet = await findOrCreateWallet(userId);
  }

  // Fetch wallet with transactions
  const walletWithTransactions = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  return walletWithTransactions;
}

/**
 * Consume tokens from wallet
 */
export async function consumeTokens(
  userId: string,
  amount: number,
  description?: string
) {
  if (!amount || amount <= 0) {
    throw new ValidationError("Valid amount required");
  }

  let wallet = await findWalletByUserId(userId);

  if (!wallet) {
    throw new NotFoundError("Wallet");
  }

  if (wallet.balance < amount) {
    throw new ValidationError("Insufficient tokens");
  }

  // Perform transaction
  await prisma.$transaction(async tx => {
    // Deduct tokens
    await tx.wallet.update({
      where: { id: wallet!.id },
      data: { balance: { decrement: amount } },
    });

    // Create transaction record
    await createTokenTransaction({
      walletId: wallet!.id,
      userId,
      type: "CONSUMPTION",
      amount,
      description: description || "Token consumption",
    });
  });

  // Fetch updated wallet
  const updatedWallet = await findWalletByUserId(userId);

  return updatedWallet;
}

