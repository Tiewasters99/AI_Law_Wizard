// Service for document analysis session management

import {
  createDocumentSession,
  getActiveSession,
  getSessionById,
  getUserSessions,
  deactivateSession,
  updateSessionTitle,
} from "../../../repositories/client/documentSessionRepository";
import {
  getAllSessionMessages,
  createMessage,
} from "../../../repositories/client/documentMessageRepository";
import { MessageRole } from "@prisma/client";
import { ValidationError } from "../../../utils/errors";

/**
 * Get or create active session for user
 */
export async function getOrCreateActiveSessionService(
  userId: string
): Promise<{ id: string; title: string | null; createdAt: Date }> {
  let session = await getActiveSession(userId);

  if (!session) {
    session = await createDocumentSession({
      userId,
      title: "Document Assistant Chat",
    });
  }

  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
  };
}

/**
 * Create new session for user
 */
export async function createNewSessionService(
  userId: string,
  title?: string
): Promise<{ id: string; title: string | null; createdAt: Date }> {
  // Deactivate current active session if exists
  const currentSession = await getActiveSession(userId);
  if (currentSession) {
    await deactivateSession(currentSession.id, userId);
  }

  const session = await createDocumentSession({
    userId,
    title: title || "Document Assistant Chat",
  });

  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
  };
}

/**
 * Get session messages for display
 */
export async function getSessionMessagesService(
  sessionId: string,
  userId: string
): Promise<
  Array<{
    id: string;
    role: MessageRole;
    content: string;
    createdAt: Date;
    sources?: any;
  }>
> {
  const session = await getSessionById(sessionId, userId);
  if (!session) {
    throw new ValidationError("Session not found");
  }

  const messages = await getAllSessionMessages(sessionId);

  return messages.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt,
    sources: (msg.metadata as any)?.sources || undefined,
  }));
}

/**
 * Get all user sessions
 */
export async function getUserSessionsService(userId: string) {
  const sessions = await getUserSessions(userId);
  return sessions.map(session => ({
    id: session.id,
    title: session.title,
    isActive: session.isActive,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  }));
}

/**
 * Update session title
 */
export async function updateSessionTitleService(
  sessionId: string,
  userId: string,
  title: string
) {
  const session = await updateSessionTitle(sessionId, userId, title);
  return {
    id: session.id,
    title: session.title,
  };
}

/**
 * Deactivate session
 */
export async function deactivateSessionService(
  sessionId: string,
  userId: string
) {
  const session = await deactivateSession(sessionId, userId);
  return {
    id: session.id,
    isActive: session.isActive,
  };
}
