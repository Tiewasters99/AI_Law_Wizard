// Service for attorney conversations functionality

import {
  findConversationsByAttorneyId,
  findConversationById,
} from "../../../repositories/attorney/conversationRepository";
import { findMessagesByConversationId } from "../../../repositories/attorney/messageRepository";

/**
 * Get all conversations for an attorney
 */
export async function getAttorneyConversations(attorneyId: string) {
  const conversations = await findConversationsByAttorneyId(attorneyId);

  // Format conversations with last message and unread count
  return conversations.map(conversation => {
    const unreadCount = conversation.unreadByAttorney;
    const lastMessage = conversation.messages[0] || null;

    return {
      id: conversation.id,
      consultationRequestId: conversation.consultationRequestId,
      otherParty: conversation.client,
      consultationRequest: conversation.consultationRequest,
      lastMessage,
      unreadCount,
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
    };
  });
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(
  conversationId: string,
  attorneyId: string
) {
  // Verify conversation exists and attorney has access
  const conversation = await findConversationById(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.attorneyId !== attorneyId) {
    throw new Error("Access denied");
  }

  // Fetch messages
  return await findMessagesByConversationId(conversationId);
}

