// Repository for document analysis message database operations

import { prisma } from "../../prisma";
import { MessageRole } from "@prisma/client";

export interface DocumentAnalysisMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  metadata: any;
  tokenCount: number | null;
  modelUsed: string | null;
  createdAt: Date;
}

export interface CreateMessageData {
  sessionId: string;
  role: MessageRole;
  content: string;
  metadata?: any;
  tokenCount?: number;
  modelUsed?: string;
}

/**
 * Create a new message in a session
 */
export async function createMessage(
  data: CreateMessageData
): Promise<DocumentAnalysisMessage> {
  return await prisma.documentAnalysisMessage.create({
    data: {
      sessionId: data.sessionId,
      role: data.role,
      content: data.content,
      metadata: data.metadata || null,
      tokenCount: data.tokenCount || null,
      modelUsed: data.modelUsed || null,
    },
  });
}

/**
 * Get messages for a session (ordered by creation time, limit to last N messages)
 */
export async function getSessionMessages(
  sessionId: string,
  limit: number = 10
): Promise<DocumentAnalysisMessage[]> {
  return await prisma.documentAnalysisMessage.findMany({
    where: {
      sessionId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit > 0 ? limit : undefined,
  });
}

/**
 * Get all messages for a session (for loading full conversation)
 */
export async function getAllSessionMessages(
  sessionId: string
): Promise<DocumentAnalysisMessage[]> {
  return await prisma.documentAnalysisMessage.findMany({
    where: {
      sessionId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * Delete all messages for a session
 */
export async function deleteSessionMessages(sessionId: string): Promise<void> {
  await prisma.documentAnalysisMessage.deleteMany({
    where: {
      sessionId,
    },
  });
}
