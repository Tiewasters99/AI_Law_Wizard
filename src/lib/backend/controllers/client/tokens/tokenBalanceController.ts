// Controller for client token balance API endpoints

import { verifyClientAccess } from "../../../utils/clientAuth";
import { getTokenBalance } from "../../../services/client/tokens/tokenBalanceService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get token balance
 */
export async function handleGetTokenBalance(
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const result = await getTokenBalance(userId);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch token balance");
  }
}

