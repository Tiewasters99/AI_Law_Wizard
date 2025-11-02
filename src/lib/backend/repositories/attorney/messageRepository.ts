// Repository for message database operations

import { prisma } from "../../prisma";

export interface MessageWithSender {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: any;
  isRead: boolean;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export interface CreateMessageData {
  conversationId: string;
  senderId: string;
  content: string;
}

/**
 * Find all messages in a conversation
 */
export async function findMessagesByConversationId(
  conversationId: string
): Promise<MessageWithSender[]> {
  return await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * Create a new message
 */
export async function createMessage(
  data: CreateMessageData,
  attachments?: any
): Promise<MessageWithSender> {
  return await prisma.message.create({
    data: {
      conversationId: data.conversationId,
      senderId: data.senderId,
      content: data.content,
      attachments: attachments || null,
      isRead: false,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

/**
 * Mark messages as read in a conversation (for client)
 */
export async function markMessagesAsReadForClient(
  conversationId: string,
  clientId: string
): Promise<void> {
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: clientId },
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

/**
 * Count unread messages for client in conversations
 */
export async function countUnreadMessagesForClient(
  clientId: string
): Promise<number> {
  return await prisma.message.count({
    where: {
      conversation: {
        clientId,
      },
      isRead: false,
    },
  });
}

