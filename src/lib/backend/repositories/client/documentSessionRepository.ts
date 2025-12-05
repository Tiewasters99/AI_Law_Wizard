// Repository for document analysis session database operations

import { prisma } from "../../prisma";
import { ChatMode } from "@prisma/client";

export interface DocumentAnalysisSession {
  id: string;
  userId: string | null;
  mode: ChatMode;
  title: string | null;
  context: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentSessionData {
  userId: string;
  title?: string;
  mode?: ChatMode;
  context?: any;
}

/**
 * Create a new document analysis session
 */
export async function createDocumentSession(
  data: CreateDocumentSessionData
): Promise<DocumentAnalysisSession> {
  return await prisma.documentAnalysisSession.create({
    data: {
      userId: data.userId,
      title: data.title || null,
      mode: data.mode || "QA",
      context: data.context || null,
      isActive: true,
    },
  });
}

/**
 * Get user's active session
 */
export async function getActiveSession(
  userId: string
): Promise<DocumentAnalysisSession | null> {
  const session = await prisma.documentAnalysisSession.findFirst({
    where: {
      userId,
      isActive: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return session;
}

/**
 * Get session by ID (with user verification)
 */
export async function getSessionById(
  sessionId: string,
  userId: string
): Promise<DocumentAnalysisSession | null> {
  const session = await prisma.documentAnalysisSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  return session;
}

/**
 * Update session title
 */
export async function updateSessionTitle(
  sessionId: string,
  userId: string,
  title: string
): Promise<DocumentAnalysisSession> {
  const session = await getSessionById(sessionId, userId);
  if (!session) {
    throw new Error("Session not found");
  }

  return await prisma.documentAnalysisSession.update({
    where: { id: sessionId },
    data: { title },
  });
}

/**
 * Deactivate session (mark as inactive)
 */
export async function deactivateSession(
  sessionId: string,
  userId: string
): Promise<DocumentAnalysisSession> {
  const session = await getSessionById(sessionId, userId);
  if (!session) {
    throw new Error("Session not found");
  }

  return await prisma.documentAnalysisSession.update({
    where: { id: sessionId },
    data: { isActive: false },
  });
}

/**
 * Get all user sessions
 */
export async function getUserSessions(
  userId: string
): Promise<DocumentAnalysisSession[]> {
  return await prisma.documentAnalysisSession.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}
