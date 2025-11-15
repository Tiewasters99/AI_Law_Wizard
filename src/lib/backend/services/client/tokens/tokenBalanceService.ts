// Service for client token balance functionality

import { findOrCreateWallet } from "../../../repositories/purchase/walletRepository";
import {
  getTokenTransactionsByUserId,
  aggregateTokenTransactions,
} from "../../../repositories/attorney/tokenTransactionRepository";

/**
 * Get token balance and statistics for a client
 */
export async function getTokenBalance(clientId: string) {
  const wallet = await findOrCreateWallet(clientId);

  // Calculate total purchased
  const totalPurchased = await aggregateTokenTransactions(clientId, "PURCHASE");

  // Calculate total consumed
  const totalConsumed = await aggregateTokenTransactions(
    clientId,
    "CONSUMPTION"
  );

  return {
    balance: wallet.balance,
    totalPurchased: totalPurchased || 0,
    totalConsumed: Math.abs(totalConsumed || 0),
  };
}
