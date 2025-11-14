// Service for client token consumption functionality

import { deductTokens } from "../../../tokenService";
import { ValidationError } from "../../../utils/errors";

export interface ConsumeTokensRequest {
  amount: number;
  description: string;
  feature?: string;
  metadata?: Record<string, any>;
}

/**
 * Consume tokens for a client
 */
export async function consumeTokens(
  clientId: string,
  data: ConsumeTokensRequest
) {
  // Validate input
  if (!data.amount || data.amount <= 0) {
    throw new ValidationError("Amount must be greater than 0");
  }

  if (!data.description) {
    throw new ValidationError("Description is required");
  }

  // Deduct tokens using the token service
  const result = await deductTokens(
    clientId,
    data.amount,
    data.description,
    data.feature,
    data.metadata
  );

  if (!result.success) {
    throw new Error(result.error || "Failed to consume tokens");
  }

  return {
    success: true,
    newBalance: result.newBalance,
    amount: data.amount,
  };
}

