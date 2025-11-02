// Repository for conversation database operations

import { prisma } from "../../prisma";

export interface ConversationWithRelations {
  id: string;
  consultationRequestId: string;
  clientId: string;
  attorneyId: string;
  lastMessageAt: Date;
  unreadByClient: number;
  unreadByAttorney: number;
  createdAt: Date;
  updatedAt: Date;
  client: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    customerProfile?: {
      companyName: string | null;
    } | null;
  };
  attorney: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    lawyerProfile: {
      firmName: string | null;
      specialty: string | null;
    } | null;
  };
  consultationRequest: {
    id: string;
    caseType: string;
    status: string;
    urgency: string;
  } | null;
  messages: Array<{
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    isRead: boolean;
  }>;
}

/**
 * Find conversation by ID
 */
export async function findConversationById(id: string): Promise<{
  id: string;
  attorneyId: string;
  clientId: string;
} | null> {
  return await prisma.conversation.findUnique({
    where: { id },
    select: {
      id: true,
      attorneyId: true,
      clientId: true,
    },
  });
}

/**
 * Find all conversations for an attorney
 */
export async function findConversationsByAttorneyId(
  attorneyId: string
): Promise<ConversationWithRelations[]> {
  return await prisma.conversation.findMany({
    where: {
      attorneyId,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          customerProfile: {
            select: {
              companyName: true,
            },
          },
        },
      },
      attorney: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          lawyerProfile: {
            select: {
              firmName: true,
              specialty: true,
            },
          },
        },
      },
      consultationRequest: {
        select: {
          id: true,
          caseType: true,
          status: true,
          urgency: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          content: true,
          createdAt: true,
          senderId: true,
          isRead: true,
        },
      },
    },
    orderBy: {
      lastMessageAt: "desc",
    },
  });
}

/**
 * Find all conversations for a client
 */
export async function findConversationsByClientId(
  clientId: string
): Promise<ConversationWithRelations[]> {
  const conversations = await prisma.conversation.findMany({
    where: {
      clientId,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          customerProfile: {
            select: {
              companyName: true,
            },
          },
        },
      },
      attorney: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          lawyerProfile: {
            select: {
              practiceAreas: true,
            },
          },
        },
      },
      consultationRequest: {
        select: {
          id: true,
          caseType: true,
          status: true,
          urgency: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          content: true,
          createdAt: true,
          senderId: true,
          isRead: true,
        },
      },
    },
    orderBy: {
      lastMessageAt: "desc",
    },
  });

  // Map to match ConversationWithRelations interface - ensure customerProfile is always present
  return conversations.map((conv: any) => ({
    ...conv,
    client: {
      ...conv.client,
      customerProfile: conv.client.customerProfile || null,
    },
  })) as ConversationWithRelations[];
}

/**
 * Update conversation unread count for client
 */
export async function updateConversationUnreadByClient(
  conversationId: string,
  count: number
): Promise<void> {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      unreadByClient: count,
    },
  });
}

/**
 * Update conversation with last message time and increment attorney unread count
 */
export async function updateConversationOnClientMessage(
  conversationId: string
): Promise<void> {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      unreadByAttorney: { increment: 1 },
    },
  });
}

/**
 * Update conversation with last message time and unread count (for attorney messages)
 */
export async function updateConversationOnNewMessage(
  conversationId: string,
  incrementClientUnread: boolean
): Promise<void> {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      unreadByClient: incrementClientUnread ? { increment: 1 } : undefined,
    },
  });
}
