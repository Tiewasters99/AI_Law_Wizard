// Controller for attorney query history API endpoint

import { NextRequest } from "next/server";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import { getQueryHistory } from "../../../services/attorney/queryHistory/queryHistoryService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get query history
 */
export async function handleGetQueryHistory(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;

    const queries = await getQueryHistory(userId, search);

    return successResponse({
      success: true,
      queries,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch query history");
  }
}

