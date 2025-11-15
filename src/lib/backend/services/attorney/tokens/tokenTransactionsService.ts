// Service for attorney token transactions functionality

import { getTokenTransactionsByUserId } from "../../../repositories/attorney/tokenTransactionRepository";

export interface TransactionListOptions {
  limit?: number;
  offset?: number;
}

/**
 * Get token transaction history for an attorney
 */
export async function getTokenTransactions(
  attorneyId: string,
  options: TransactionListOptions = {}
) {
  const limit = options.limit || 50;
  const offset = options.offset || 0;

  const transactions = await getTokenTransactionsByUserId(attorneyId, {
    limit: limit + offset,
  });

  // Apply pagination
  const paginated = transactions.slice(offset, offset + limit);

  // Format transactions
  const formatted = paginated.map(tx => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    feature: tx.feature,
    description: tx.description,
    reference: tx.reference,
    metadata: tx.metadata,
    createdAt: tx.createdAt,
  }));

  return {
    transactions: formatted,
    total: transactions.length,
  };
}
