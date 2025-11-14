// Repository for client chat session database operations

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
  userId: string;
  title?: string;
  metadata?: any;
}

export interface UpdateChatSessionData {
  title?: string;
  metadata?: any;
  isActive?: boolean;
}

/**
 * Create a new chat session for a client
 */
export async function createChatSession(
  data: CreateChatSessionData
): Promise<ChatSession> {
  return await prisma.chatSession.create({
    data: {
      userId: data.userId,
      title: data.title || null,
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
 * Find all chat sessions for a specific user
 */
export async function findChatSessionsByUserId(
  userId: string,
  limit: number = 50
): Promise<ChatSession[]> {
  return await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

/**
 * Find active chat session for a user
 */
export async function findActiveChatSessionByUserId(
  userId: string
): Promise<ChatSession | null> {
  return await prisma.chatSession.findFirst({
    where: {
      userId,
      isActive: true,
    },
    orderBy: { updatedAt: "desc" },
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

  if (data.title !== undefined) {
    updateData.title = data.title;
  }

  if (data.metadata !== undefined) {
    updateData.metadata = data.metadata;
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
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
