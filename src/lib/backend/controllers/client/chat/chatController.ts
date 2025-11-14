// Controller for client chat API endpoints

import { NextRequest } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import {
  loadChatHistory,
  loadChatMessages,
  getChatSession,
  createNewChatSession,
  removeChatSession,
  updateSessionTitle,
} from "../../../services/client/chat/chatService";
import { successResponse, errorResponse } from "../../../utils/response";
import { NotFoundError } from "../../../utils/errors";

/**
 * Handle GET request - List all chat sessions for a user
 */
export async function handleListChatSessions(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const limitNum = limit ? parseInt(limit, 10) : 50;

    const sessions = await loadChatHistory(userId, limitNum);

    return successResponse({ sessions });
  } catch (error) {
    return errorResponse(error, "Failed to fetch chat sessions");
  }
}

/**
 * Handle POST request - Create a new chat session
 */
export async function handleCreateChatSession(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const body = await request.json();
    const { title } = body;

    const session = await createNewChatSession(userId, title);

    return successResponse({ session });
  } catch (error) {
    return errorResponse(error, "Failed to create chat session");
  }
}

/**
 * Handle GET request - Get a specific chat session
 */
export async function handleGetChatSession(
  request: NextRequest,
  userId: string,
  sessionId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const session = await getChatSession(sessionId);

    // Verify the session belongs to the user
    if (session.userId !== userId) {
      return errorResponse(new Error("Unauthorized"), "Unauthorized", 403);
    }

    return successResponse({ session });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error, "Chat session not found", 404);
    }
    return errorResponse(error, "Failed to fetch chat session");
  }
}

/**
 * Handle PATCH request - Update a chat session
 */
export async function handleUpdateChatSession(
  request: NextRequest,
  userId: string,
  sessionId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const session = await getChatSession(sessionId);

    // Verify the session belongs to the user
    if (session.userId !== userId) {
      return errorResponse(new Error("Unauthorized"), "Unauthorized", 403);
    }

    const body = await request.json();
    const { title } = body;

    if (title !== undefined) {
      const updatedSession = await updateSessionTitle(sessionId, title);
      return successResponse({ session: updatedSession });
    }

    return successResponse({ session });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error, "Chat session not found", 404);
    }
    return errorResponse(error, "Failed to update chat session");
  }
}

/**
 * Handle DELETE request - Delete a chat session
 */
export async function handleDeleteChatSession(
  request: NextRequest,
  userId: string,
  sessionId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const session = await getChatSession(sessionId);

    // Verify the session belongs to the user
    if (session.userId !== userId) {
      return errorResponse(new Error("Unauthorized"), "Unauthorized", 403);
    }

    await removeChatSession(sessionId);

    return successResponse({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error, "Chat session not found", 404);
    }
    return errorResponse(error, "Failed to delete chat session");
  }
}

/**
 * Handle GET request - Get all messages for a session
 */
export async function handleGetChatMessages(
  request: NextRequest,
  userId: string,
  sessionId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const session = await getChatSession(sessionId);

    // Verify the session belongs to the user
    if (session.userId !== userId) {
      return errorResponse(new Error("Unauthorized"), "Unauthorized", 403);
    }

    const messages = await loadChatMessages(sessionId);

    return successResponse({ messages, session });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse(error, "Chat session not found", 404);
    }
    return errorResponse(error, "Failed to fetch chat messages");
  }
}

