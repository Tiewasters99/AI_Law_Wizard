// Controller for attorney token transactions API endpoints

import { NextRequest } from "next/server";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import { getTokenTransactions } from "../../../services/attorney/tokens/tokenTransactionsService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get token transactions
 */
export async function handleGetTokenTransactions(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await getTokenTransactions(userId, { limit, offset });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch transactions");
  }
}
