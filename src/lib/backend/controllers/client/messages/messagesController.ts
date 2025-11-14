// Controller for client messages API endpoints

import { NextRequest } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import {
  getClientConversationMessages,
  sendClientMessage,
} from "../../../services/client/messages/messagesService";
import { successResponse, errorResponse } from "../../../utils/response";
import { prisma } from "../../../prisma";

/**
 * Handle GET request - Get messages in a conversation
 */
export async function handleGetMessages(
  conversationId: string,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const result = await getClientConversationMessages(conversationId, userId);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch messages");
  }
}

/**
 * Handle POST request - Send a message
 */
export async function handleSendMessage(
  request: NextRequest,
  conversationId: string,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const body = await request.json();
    const { content, attachments } = body;

    // Get client name
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    const clientName = user?.name || "a client";

    const result = await sendClientMessage(
      conversationId,
      userId,
      clientName,
      content,
      attachments
    );

    return successResponse({
      message: result.message,
      success: true,
    });
  } catch (error) {
    return errorResponse(error, "Failed to send message");
  }
}

