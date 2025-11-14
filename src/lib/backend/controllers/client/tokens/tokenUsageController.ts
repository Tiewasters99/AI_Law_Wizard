// Controller for client token usage API endpoints

import { verifyClientAccess } from "../../../utils/clientAuth";
import { getTokenUsageStats } from "../../../services/client/tokens/tokenUsageService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get token usage statistics
 */
export async function handleGetTokenUsage(userId: string): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const result = await getTokenUsageStats(userId);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch usage stats");
  }
}

