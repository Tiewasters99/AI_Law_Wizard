// Service for document processing session management

import {
  createChatSession,
  findChatSessionById,
  findAllChatSessions,
  updateChatSession,
  deleteChatSession,
} from "../../../repositories/attorney/chatSessionRepository";

export interface CreateSessionData {
  userPrompt: string;
  processedFiles?: any[];
  analysisResult: string;
}

/**
 * Create a new document processing session
 */
export async function createDocumentSession(data: CreateSessionData) {
  const session = await createChatSession({
    metadata: {
      userPrompt: data.userPrompt,
      processedFiles: data.processedFiles || [],
      analysisResult: data.analysisResult,
    },
  });

  return {
    id: session.id,
    userPrompt: data.userPrompt,
    processedFiles: data.processedFiles || [],
    analysisResult: data.analysisResult,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

/**
 * Get a specific session
 */
export async function getDocumentSession(sessionId: string) {
  const session = await findChatSessionById(sessionId);
  if (!session) {
    return null;
  }

  const context = (session.metadata as any) || {};

  return {
    sessionId: session.id,
    userPrompt: context.userPrompt || "",
    processedFiles: context.processedFiles || [],
    analysisResult: context.analysisResult || "",
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

/**
 * Get all sessions
 */
export async function getAllDocumentSessions() {
  const sessions = await findAllChatSessions(50);

  return sessions.map(session => {
    const context =
      typeof session.metadata === "string"
        ? JSON.parse(session.metadata)
        : session.metadata || {};

    return {
      sessionId: session.id,
      userPrompt: context.userPrompt || "",
      processedFiles: context.processedFiles || [],
      analysisResult: context.analysisResult || "",
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  });
}

/**
 * Update a session
 */
export async function updateDocumentSession(sessionId: string, updates: any) {
  await updateChatSession(sessionId, { metadata: updates });
  return { sessionId };
}

/**
 * Delete a session
 */
export async function deleteDocumentSession(sessionId: string) {
  await deleteChatSession(sessionId);
  return { success: true };
}
