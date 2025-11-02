// Service for client messages functionality

import {
  findConversationById,
  updateConversationUnreadByClient,
  updateConversationOnClientMessage,
} from "../../../repositories/attorney/conversationRepository";
import {
  findMessagesByConversationId,
  createMessage,
  markMessagesAsReadForClient,
} from "../../../repositories/attorney/messageRepository";
import { createNotification } from "../../../repositories/attorney/notificationRepository";
import { NotFoundError, ValidationError } from "../../../utils/errors";

/**
 * Get messages in a conversation (client view)
 */
export async function getClientConversationMessages(
  conversationId: string,
  clientId: string
) {
  // Verify conversation belongs to client
  const conversation = await findConversationById(conversationId);

  if (!conversation || conversation.clientId !== clientId) {
    throw new NotFoundError("Conversation not found");
  }

  // Fetch messages
  const messages = await findMessagesByConversationId(conversationId);

  // Mark messages as read
  await markMessagesAsReadForClient(conversationId, clientId);

  // Update unread count
  await updateConversationUnreadByClient(conversationId, 0);

  return { messages };
}

/**
 * Send a message in a conversation (from client)
 */
export async function sendClientMessage(
  conversationId: string,
  clientId: string,
  clientName: string,
  content: string,
  attachments?: any
) {
  // Verify conversation belongs to client
  const conversation = await findConversationById(conversationId);

  if (!conversation || conversation.clientId !== clientId) {
    throw new NotFoundError("Conversation not found");
  }

  if (!content || !content.trim()) {
    throw new ValidationError("Message content is required");
  }

  // Create message
  const message = await createMessage(
    {
      conversationId,
      senderId: clientId,
      content: content.trim(),
    },
    attachments
  );

  // Update conversation with last message time and increment attorney unread count
  await updateConversationOnClientMessage(conversationId);

  // Create notification for attorney
  await createNotification({
    userId: conversation.attorneyId,
    type: "MESSAGE_RECEIVED",
    title: "New Message",
    message: `You have a new message from ${clientName}`,
    relatedId: conversationId,
  });

  return { message };
}
