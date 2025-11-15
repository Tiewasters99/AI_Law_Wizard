// Controller for attorney token usage API endpoints

import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import { getTokenUsageStats } from "../../../services/attorney/tokens/tokenUsageService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get token usage statistics
 */
export async function handleGetTokenUsage(userId: string): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    const result = await getTokenUsageStats(userId);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch usage stats");
  }
}
