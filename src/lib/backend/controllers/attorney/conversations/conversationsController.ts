// Controller for attorney conversations API endpoints

import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import { getAttorneyConversations } from "../../../services/attorney/conversations/conversationsService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get all conversations for attorney
 */
export async function handleGetConversations(
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);
    const conversations = await getAttorneyConversations(userId);
    return successResponse({
      success: true,
      conversations,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch conversations");
  }
}
