// Repository for wallet database operations

import { prisma } from "../../prisma";

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
}

/**
 * Find wallet by user ID
 */
export async function findWalletByUserId(
  userId: string
): Promise<Wallet | null> {
  return await prisma.wallet.findUnique({
    where: { userId },
  });
}

/**
 * Create a new wallet for a user
 */
export async function createWallet(userId: string): Promise<Wallet> {
  return await prisma.wallet.create({
    data: { userId },
  });
}

/**
 * Find or create wallet for a user
 */
export async function findOrCreateWallet(userId: string): Promise<Wallet> {
  let wallet = await findWalletByUserId(userId);

  if (!wallet) {
    wallet = await createWallet(userId);
  }

  return wallet;
}

/**
 * Create wallet with starter tokens
 */
export async function createWalletWithStarterTokens(
  userId: string,
  starterBalance: number = 5000
): Promise<Wallet> {
  return await prisma.wallet.create({
    data: {
      userId,
      balance: starterBalance,
    },
  });
}
