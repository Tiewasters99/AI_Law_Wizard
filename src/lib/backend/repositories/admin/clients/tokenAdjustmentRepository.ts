// Repository for admin client token adjustments

import { prisma } from "../../../prisma";

/**
 * Adjust client tokens with transaction logging
 */
export async function adjustClientTokens(
  userId: string,
  amount: number, // Positive to add, negative to subtract
  reason: string,
  adminId: string
) {
  return await prisma.$transaction(async tx => {
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
      select: {
        balance: true,
      },
    });

    // Create transaction record
    await tx.tokenTransaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: "ADMIN_ADJUSTMENT",
        amount: Math.abs(amount), // Store absolute value
        description: reason,
        reference: `ADMIN_${adminId}`,
        metadata: {
          adjustmentType: amount >= 0 ? "ADD" : "SUBTRACT",
          adminId,
          originalAmount: amount,
        },
      },
    });

    return updatedWallet.balance;
  });
}
