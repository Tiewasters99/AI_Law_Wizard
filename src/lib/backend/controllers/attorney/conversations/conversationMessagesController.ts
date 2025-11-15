// Controller for conversation messages API endpoint

import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import { getConversationMessages } from "../../../services/attorney/conversations/conversationsService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get messages for a conversation
 */
export async function handleGetConversationMessages(
  conversationId: string,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);
    const messages = await getConversationMessages(conversationId, userId);
    return successResponse({
      success: true,
      messages,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch messages");
  }
}
