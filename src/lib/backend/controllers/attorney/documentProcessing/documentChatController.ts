// Controller for document processing chat API endpoints

import { NextRequest } from "next/server";
import {
  processChatMessage,
  getChatSession,
} from "../../../services/attorney/documentProcessing/documentChatService";
import { successResponse, errorResponse } from "../../../utils/response";
import {
  validateNonEmptyString,
  validateRequired,
} from "../../../utils/validation";

/**
 * Handle POST request - Process chat message
 */
export async function handleChatMessage(
  request: NextRequest
): Promise<Response> {
  try {
    const body = await request.json();
    const { message, sessionId, context } = body;

    validateNonEmptyString(message, "Message");

    const result = await processChatMessage(message, context, sessionId);

    return successResponse({
      success: true,
      response: result.response,
      sessionId: result.sessionId,
    });
  } catch (error) {
    return errorResponse(error, "Internal server error during chat processing");
  }
}

/**
 * Handle GET request - Get chat session
 */
export async function handleGetChatSession(
  request: NextRequest
): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    validateRequired(sessionId, "Session ID");

    const session = await getChatSession(sessionId!);

    if (!session) {
      return errorResponse(new Error("Session not found"), "Session not found");
    }

    return successResponse({
      success: true,
      session,
    });
  } catch (error) {
    return errorResponse(error, "Internal server error");
  }
}
