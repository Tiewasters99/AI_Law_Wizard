// Controller for client token transactions API endpoints

import { NextRequest } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import { getTokenTransactions } from "../../../services/client/tokens/tokenTransactionsService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get token transactions
 */
export async function handleGetTokenTransactions(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await getTokenTransactions(userId, { limit, offset });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch transactions");
  }
}

