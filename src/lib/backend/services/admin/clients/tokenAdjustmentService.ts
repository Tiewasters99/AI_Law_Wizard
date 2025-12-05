// Service for admin client token adjustments

import { adjustClientTokens } from "../../../repositories/admin/clients/tokenAdjustmentRepository";
import { findClientById } from "../../../repositories/admin/clients/clientsRepository";
import { ValidationError, NotFoundError } from "../../../utils/errors";

/**
 * Adjust client token balance
 */
export async function adjustClientTokenBalance(
  userId: string,
  amount: number,
  reason: string,
  adminId: string
) {
  if (!userId) {
    throw new ValidationError("User ID is required");
  }

  if (!reason || reason.trim().length === 0) {
    throw new ValidationError("Reason is required for token adjustments");
  }

  // Check if client exists
  const client = await findClientById(userId);
  if (!client) {
    throw new NotFoundError("Client");
  }

  // Validate amount
  if (amount === 0) {
    throw new ValidationError("Amount cannot be zero");
  }

  const newBalance = await adjustClientTokens(
    userId,
    amount,
    reason.trim(),
    adminId
  );

  return {
    success: true,
    newBalance,
    previousBalance: client.tokenBalance,
    adjustment: amount,
  };
}
