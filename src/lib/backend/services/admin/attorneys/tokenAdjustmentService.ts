// Service for admin attorney token adjustments

import { adjustAttorneyTokens } from "../../../repositories/admin/attorneys/tokenAdjustmentRepository";
import { findAttorneyById } from "../../../repositories/admin/attorneys/attorneysRepository";
import { ValidationError, NotFoundError } from "../../../utils/errors";

/**
 * Adjust attorney token balance
 */
export async function adjustAttorneyTokenBalance(
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

  // Check if attorney exists
  const attorney = await findAttorneyById(userId);
  if (!attorney) {
    throw new NotFoundError("Attorney");
  }

  // Validate amount
  if (amount === 0) {
    throw new ValidationError("Amount cannot be zero");
  }

  const newBalance = await adjustAttorneyTokens(
    userId,
    amount,
    reason.trim(),
    adminId
  );

  return {
    success: true,
    newBalance,
    previousBalance: attorney.tokenBalance,
    adjustment: amount,
  };
}
