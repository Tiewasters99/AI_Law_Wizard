// Service for client chat session and message management

import {
  createChatSession,
  findChatSessionById,
  findChatSessionsByUserId,
  findActiveChatSessionByUserId,
  updateChatSession,
  deleteChatSession,
  type ChatSession,
} from "../../../repositories/client/chatSessionRepository";
import {
  createChatMessage,
  findMessagesBySessionId,
  type ChatMessage,
  type CreateChatMessageData,
} from "../../../repositories/client/chatMessageRepository";
import { NotFoundError } from "../../../utils/errors";

/**
 * Create a new chat session or get the active session for a user
 */
export async function createOrGetChatSession(
  userId: string,
  title?: string
): Promise<ChatSession> {
  // Check if there's an active session
  const activeSession = await findActiveChatSessionByUserId(userId);
  if (activeSession) {
    // Update title if provided and session doesn't have one
    if (title && !activeSession.title) {
      return await updateChatSession(activeSession.id, { title });
    }
    return activeSession;
  }

  // Create a new session
  return await createChatSession({
    userId,
    title: title,
    metadata: {},
  });
}

/**
 * Save a chat message to the database
 */
export async function saveChatMessage(
  sessionId: string,
  role: "USER" | "ASSISTANT" | "SYSTEM",
  content: string,
  metadata?: any,
  tokenCount?: number,
  modelUsed?: string
): Promise<ChatMessage> {
  return await createChatMessage({
    sessionId,
    role,
    content,
    metadata,
    tokenCount,
    modelUsed,
  });
}

/**
 * Load all chat sessions for a user
 */
export async function loadChatHistory(
  userId: string,
  limit: number = 50
): Promise<ChatSession[]> {
  return await findChatSessionsByUserId(userId, limit);
}

/**
 * Load all messages for a specific session
 */
export async function loadChatMessages(
  sessionId: string
): Promise<ChatMessage[]> {
  const session = await findChatSessionById(sessionId);
  if (!session) {
    throw new NotFoundError("Chat session");
  }

  return await findMessagesBySessionId(sessionId);
}

/**
 * Update session title
 */
export async function updateSessionTitle(
  sessionId: string,
  title: string
): Promise<ChatSession> {
  const session = await findChatSessionById(sessionId);
  if (!session) {
    throw new NotFoundError("Chat session");
  }

  return await updateChatSession(sessionId, { title });
}

/**
 * Create a new chat session (explicitly, not getting active)
 */
export async function createNewChatSession(
  userId: string,
  title?: string
): Promise<ChatSession> {
  // Deactivate all existing sessions for this user
  const existingSessions = await findChatSessionsByUserId(userId);
  for (const session of existingSessions) {
    if (session.isActive) {
      await updateChatSession(session.id, { isActive: false });
    }
  }

  // Create new active session
  return await createChatSession({
    userId,
    title: title,
    metadata: {},
  });
}

/**
 * Get a chat session by ID
 */
export async function getChatSession(
  sessionId: string
): Promise<ChatSession> {
  const session = await findChatSessionById(sessionId);
  if (!session) {
    throw new NotFoundError("Chat session");
  }
  return session;
}

/**
 * Delete a chat session
 */
export async function removeChatSession(sessionId: string): Promise<void> {
  const session = await findChatSessionById(sessionId);
  if (!session) {
    throw new NotFoundError("Chat session");
  }
  await deleteChatSession(sessionId);
}

/**
 * Generate a title from the first user message
 */
export function generateSessionTitle(firstMessage: string): string {
  // Take first 50 characters and clean up
  const title = firstMessage
    .trim()
    .split("\n")[0]
    .substring(0, 50)
    .trim();
  return title || "New Chat";
}

