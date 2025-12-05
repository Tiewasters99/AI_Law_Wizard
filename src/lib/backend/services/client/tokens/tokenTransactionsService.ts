// Service for client token transactions functionality

import { getTokenTransactionsByUserId } from "../../../repositories/attorney/tokenTransactionRepository";

export interface TransactionListOptions {
  limit?: number;
  offset?: number;
}

/**
 * Get token transaction history for a client
 */
export async function getTokenTransactions(
  clientId: string,
  options: TransactionListOptions = {}
) {
  const limit = options.limit || 50;
  const offset = options.offset || 0;

  const transactions = await getTokenTransactionsByUserId(clientId, {
    limit: limit + offset,
  });

  // Apply pagination
  const paginated = transactions.slice(offset, offset + limit);

  // Format transactions
  const formatted = paginated.map(tx => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    description: tx.description,
    metadata: tx.metadata,
    createdAt: tx.createdAt,
  }));

  return {
    transactions: formatted,
    total: transactions.length,
  };
}
