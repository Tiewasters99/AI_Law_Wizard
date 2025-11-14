// Controller for client conversations API endpoints

import { verifyClientAccess } from "../../../utils/clientAuth";
import { getClientConversations } from "../../../services/client/conversations/conversationsService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get client conversations
 */
export async function handleGetConversations(
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const result = await getClientConversations(userId);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch conversations");
  }
}

