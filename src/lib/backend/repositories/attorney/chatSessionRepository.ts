// Repository for chat session database operations

import { prisma } from "../../prisma";

export interface ChatSession {
  id: string;
  title: string | null;
  userId: string | null;
  isActive: boolean;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChatSessionData {
  metadata?: any;
}

export interface UpdateChatSessionData {
  metadata?: any;
}

/**
 * Create a new chat session
 */
export async function createChatSession(
  data: CreateChatSessionData = {}
): Promise<ChatSession> {
  return await prisma.chatSession.create({
    data: {
      metadata: data.metadata || {},
    },
  });
}

/**
 * Find chat session by ID
 */
export async function findChatSessionById(
  id: string
): Promise<ChatSession | null> {
  return await prisma.chatSession.findUnique({
    where: { id },
  });
}

/**
 * Find all chat sessions with limit
 */
export async function findAllChatSessions(
  limit: number = 50
): Promise<ChatSession[]> {
  return await prisma.chatSession.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Update chat session
 */
export async function updateChatSession(
  id: string,
  data: UpdateChatSessionData
): Promise<ChatSession> {
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (data.metadata !== undefined) {
    updateData.metadata = data.metadata;
  }

  return await prisma.chatSession.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Delete chat session
 */
export async function deleteChatSession(id: string): Promise<void> {
  await prisma.chatSession.delete({
    where: { id },
  });
}
