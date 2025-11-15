// Controller for document analysis session API endpoints

import { NextRequest, NextResponse } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import {
  getOrCreateActiveSessionService,
  createNewSessionService,
  getSessionMessagesService,
  getUserSessionsService,
  updateSessionTitleService,
  deactivateSessionService,
} from "../../../services/client/documentAnalysis/documentSessionService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get active session or list all sessions
 */
export async function handleGetSessions(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    if (activeOnly) {
      // Get or create active session
      const session = await getOrCreateActiveSessionService(userId);
      return successResponse({ session });
    } else {
      // Get all user sessions
      const sessions = await getUserSessionsService(userId);
      return successResponse({ sessions });
    }
  } catch (error) {
    return errorResponse(error, "Failed to fetch sessions");
  }
}

/**
 * Handle POST request - Create new session
 */
export async function handleCreateSession(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const body = await request.json();
    const { title } = body;

    const session = await createNewSessionService(userId, title);

    return successResponse({ session }, 201);
  } catch (error) {
    return errorResponse(error, "Failed to create session");
  }
}

/**
 * Handle PATCH request - Update session (title, deactivate)
 */
export async function handleUpdateSession(
  request: NextRequest,
  userId: string,
  sessionId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const body = await request.json();
    const { title, isActive } = body;

    if (title !== undefined) {
      const session = await updateSessionTitleService(sessionId, userId, title);
      return successResponse({ session });
    }

    if (isActive === false) {
      const session = await deactivateSessionService(sessionId, userId);
      return successResponse({ session });
    }

    return errorResponse(
      new Error("Invalid update parameters"),
      "Must provide 'title' or 'isActive'"
    );
  } catch (error) {
    return errorResponse(error, "Failed to update session");
  }
}

/**
 * Handle GET request - Get messages for a session
 */
export async function handleGetSessionMessages(
  request: NextRequest,
  userId: string,
  sessionId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const messages = await getSessionMessagesService(sessionId, userId);

    return successResponse({ messages });
  } catch (error) {
    return errorResponse(error, "Failed to fetch session messages");
  }
}
