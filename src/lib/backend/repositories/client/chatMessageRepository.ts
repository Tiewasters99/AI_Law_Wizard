// Repository for client chat message database operations

import { prisma } from "../../prisma";

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  metadata: any;
  tokenCount: number | null;
  modelUsed: string | null;
  createdAt: Date;
}

export interface CreateChatMessageData {
  sessionId: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  metadata?: any;
  tokenCount?: number;
  modelUsed?: string;
}

/**
 * Create a new chat message
 */
export async function createChatMessage(
  data: CreateChatMessageData
): Promise<ChatMessage> {
  return await prisma.chatMessage.create({
    data: {
      sessionId: data.sessionId,
      role: data.role,
      content: data.content,
      metadata: data.metadata || {},
      tokenCount: data.tokenCount || null,
      modelUsed: data.modelUsed || null,
    },
  });
}

/**
 * Find all messages in a chat session
 */
export async function findMessagesBySessionId(
  sessionId: string
): Promise<ChatMessage[]> {
  return await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Find messages by user ID (across all sessions)
 */
export async function findMessagesByUserId(
  userId: string,
  limit: number = 100
): Promise<ChatMessage[]> {
  return await prisma.chatMessage.findMany({
    where: {
      session: {
        userId,
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
