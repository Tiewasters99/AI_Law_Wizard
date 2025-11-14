// Repository for chat message database operations

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
  role: string;
  content: string;
  metadata?: any;
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
      role: data.role as "USER" | "ASSISTANT" | "SYSTEM",
      content: data.content,
      metadata: data.metadata || {},
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
