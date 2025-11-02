// Controller for attorney messages API endpoint

import { NextRequest } from "next/server";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import { sendMessage } from "../../../services/attorney/messages/messagesService";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateRequired, validateNonEmptyString } from "../../../utils/validation";

/**
 * Handle POST request - Send a message
 */
export async function handleSendMessage(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    const body = await request.json();
    const { conversationId, content } = body;

    validateRequired(conversationId, "Conversation ID");
    const validatedContent = validateNonEmptyString(content, "Content");

    const message = await sendMessage(
      {
        conversationId,
        senderId: userId,
        content: validatedContent,
      },
      userId
    );

    return successResponse({
      success: true,
      message,
    });
  } catch (error) {
    return errorResponse(error, "Failed to send message");
  }
}

