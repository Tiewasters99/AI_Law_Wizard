// Service for attorney messages functionality

import {
  createMessage,
  type CreateMessageData,
} from "../../../repositories/attorney/messageRepository";
import {
  findConversationById,
  updateConversationOnNewMessage,
} from "../../../repositories/attorney/conversationRepository";

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  data: CreateMessageData,
  attorneyId: string
) {
  // Verify conversation exists and attorney has access
  const conversation = await findConversationById(data.conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.attorneyId !== attorneyId) {
    throw new Error("Access denied");
  }

  // Create message
  const message = await createMessage(data);

  // Update conversation last message time and unread count
  await updateConversationOnNewMessage(data.conversationId, true);

  return message;
}

