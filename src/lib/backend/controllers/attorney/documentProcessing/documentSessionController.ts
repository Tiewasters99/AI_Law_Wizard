// Controller for document processing session API endpoints

import { NextRequest } from "next/server";
import {
  createDocumentSession,
  getDocumentSession,
  getAllDocumentSessions,
  updateDocumentSession,
  deleteDocumentSession,
} from "../../../services/attorney/documentProcessing/documentSessionService";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateRequired } from "../../../utils/validation";

/**
 * Handle POST request - Create session
 */
export async function handleCreateSession(
  request: NextRequest
): Promise<Response> {
  try {
    const body = await request.json();
    const { userPrompt, processedFiles, analysisResult } = body;

    validateRequired(userPrompt, "User prompt");
    validateRequired(analysisResult, "Analysis result");

    const session = await createDocumentSession({
      userPrompt,
      processedFiles,
      analysisResult,
    });

    return successResponse({
      success: true,
      sessionId: session.id,
      session,
    });
  } catch (error) {
    return errorResponse(error, "Internal server error while creating session");
  }
}

/**
 * Handle GET request - Get session(s)
 */
export async function handleGetSession(
  request: NextRequest
): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const session = await getDocumentSession(sessionId);
      if (!session) {
        return errorResponse(
          new Error("Session not found"),
          "Session not found"
        );
      }
      return successResponse({
        success: true,
        session,
      });
    } else {
      const sessions = await getAllDocumentSessions();
      return successResponse({
        success: true,
        sessions,
      });
    }
  } catch (error) {
    return errorResponse(
      error,
      "Internal server error while retrieving session(s)"
    );
  }
}

/**
 * Handle PUT request - Update session
 */
export async function handleUpdateSession(
  request: NextRequest
): Promise<Response> {
  try {
    const body = await request.json();
    const { sessionId, ...updates } = body;

    validateRequired(sessionId, "Session ID");

    const result = await updateDocumentSession(sessionId, updates);

    return successResponse({
      success: true,
      sessionId: result.sessionId,
    });
  } catch (error) {
    return errorResponse(error, "Internal server error while updating session");
  }
}

/**
 * Handle DELETE request - Delete session
 */
export async function handleDeleteSession(
  request: NextRequest
): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    validateRequired(sessionId, "Session ID");

    await deleteDocumentSession(sessionId!);

    return successResponse({
      success: true,
    });
  } catch (error) {
    return errorResponse(error, "Internal server error while deleting session");
  }
}
