// Service for client conversations functionality

import {
  findConversationsByClientId,
  type ConversationWithRelations,
} from "../../../repositories/attorney/conversationRepository";

/**
 * Get conversations for a client
 */
export async function getClientConversations(clientId: string) {
  const conversations = await findConversationsByClientId(clientId);

  // Format conversations
  const formatted = conversations.map(conv => ({
    id: conv.id,
    attorney: conv.attorney,
    consultationRequest: conv.consultationRequest,
    lastMessage: conv.messages?.[0] || null,
    unreadCount: conv.unreadByClient || 0,
    lastMessageAt: conv.lastMessageAt,
  }));

  return {
    conversations: formatted,
    total: formatted.length,
  };
}

