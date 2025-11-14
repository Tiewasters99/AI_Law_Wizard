// Service for client consultation requests functionality

import { prisma } from "../../../prisma";
import { deductTokens } from "../../../tokenService";
import {
  findConsultationRequestsByClientId,
  findConsultationRequestByIdForClient,
  updateConsultationRequestStatus,
  createConsultationRequest,
  markConsultationRequestAsViewedByClient,
} from "../../../repositories/attorney/consultationRequestRepository";
import { findConversationById } from "../../../repositories/attorney/conversationRepository";
import { createMessage } from "../../../repositories/attorney/messageRepository";
import { createNotification } from "../../../repositories/attorney/notificationRepository";
import { NotFoundError, ValidationError } from "../../../utils/errors";

const CONSULTATION_REQUEST_COST = 10; // tokens

export interface CreateConsultationRequestData {
  attorneyId: string;
  caseType: string;
  urgency: string;
  description: string;
  attachmentUrls?: string[];
}

/**
 * Create a new consultation request
 */
export async function createClientConsultationRequest(
  clientId: string,
  clientName: string,
  data: CreateConsultationRequestData
) {
  // Verify attorney exists and is available
  const attorney = await prisma.user.findFirst({
    where: {
      id: data.attorneyId,
      role: "ATTORNEY",
      profileComplete: true,
    },
    include: {
      lawyerProfile: true,
    },
  });

  if (!attorney) {
    throw new NotFoundError("Attorney not found or not available");
  }

  // Deduct tokens
  const tokenResult = await deductTokens(
    clientId,
    CONSULTATION_REQUEST_COST,
    `Consultation request to ${attorney.name}`
  );

  if (!tokenResult.success) {
    throw new ValidationError(
      tokenResult.error || "Insufficient token balance"
    );
  }

  // Create consultation request and conversation in a transaction
  const result = await prisma.$transaction(async tx => {
    // Create consultation request
    const consultationRequest = await createConsultationRequest({
      clientId,
      attorneyId: data.attorneyId,
      caseType: data.caseType,
      urgency: data.urgency,
      description: data.description,
      documents: data.attachmentUrls || [],
    });

    // Create conversation
    const conversation = await tx.conversation.create({
      data: {
        clientId,
        attorneyId: data.attorneyId,
        consultationRequestId: consultationRequest.id,
        unreadByClient: 0,
        unreadByAttorney: 1,
      },
    });

    // Create initial message from client
    const initialMessage = await tx.message.create({
      data: {
        conversationId: conversation.id,
        senderId: clientId,
        content: `Consultation Request: ${data.caseType}\n\nDescription: ${data.description.trim()}\n\nUrgency: ${data.urgency}`,
        attachments: data.attachmentUrls || undefined,
      },
    });

    // Update conversation with last message
    await tx.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: initialMessage.createdAt,
      },
    });

    // Create notification for attorney
    await createNotification({
      userId: data.attorneyId,
      type: "NEW_REQUEST",
      title: "New Consultation Request",
      message: `You have a new ${data.urgency} priority consultation request from ${clientName}`,
      relatedId: conversation.id,
    });

    return {
      consultationRequest,
      conversation,
      message: initialMessage,
    };
  });

  return {
    consultationRequest: result.consultationRequest,
    conversation: result.conversation,
    initialMessage: result.message,
    tokenBalance: tokenResult.newBalance,
  };
}

/**
 * List consultation requests for a client
 */
export async function listClientConsultationRequests(
  clientId: string,
  status?: string
) {
  const requests = await findConsultationRequestsByClientId(clientId, status);
  return {
    requests,
    total: requests.length,
  };
}

/**
 * Get consultation request details for a client
 */
export async function getClientConsultationRequest(
  requestId: string,
  clientId: string
) {
  const request = await findConsultationRequestByIdForClient(
    requestId,
    clientId
  );

  if (!request) {
    throw new NotFoundError("Consultation request not found");
  }

  return { request };
}

/**
 * Update consultation request status (client can cancel)
 */
export async function updateClientConsultationRequestStatus(
  requestId: string,
  clientId: string,
  clientName: string,
  status: string
) {
  // Validate status
  const validStatuses = [
    "pending",
    "accepted",
    "in-progress",
    "completed",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    throw new ValidationError("Invalid status");
  }

  // Verify consultation request belongs to user
  const consultationRequest = await prisma.consultationRequest.findFirst({
    where: {
      id: requestId,
      clientId,
    },
    include: {
      conversation: true,
    },
  });

  if (!consultationRequest) {
    throw new NotFoundError("Consultation request not found");
  }

  // Only allow client to cancel their own requests
  if (status === "cancelled" && consultationRequest.status !== "PENDING") {
    throw new ValidationError("Can only cancel pending requests");
  }

  // Update consultation request
  const updatedRequest = await updateConsultationRequestStatus(
    requestId,
    status
  );

  // Create notification for attorney if cancelled
  if (status === "cancelled") {
    await createNotification({
      userId: consultationRequest.attorneyId,
      type: "REQUEST_CANCELLED",
      title: "Consultation Request Cancelled",
      message: `${clientName} cancelled their consultation request`,
      relatedId: consultationRequest.conversation?.id || null,
    });
  }

  return { request: updatedRequest };
}

/**
 * Mark consultation request as viewed by client
 */
export async function markRequestAsViewed(
  requestId: string,
  clientId: string
) {
  // Verify consultation request belongs to user
  const consultationRequest = await prisma.consultationRequest.findFirst({
    where: {
      id: requestId,
      clientId,
    },
  });

  if (!consultationRequest) {
    throw new NotFoundError("Consultation request not found");
  }

  // Mark as viewed
  const result = await markConsultationRequestAsViewedByClient(
    requestId,
    clientId
  );

  if (result.count === 0) {
    throw new NotFoundError("Consultation request not found or already viewed");
  }

  return { success: true };
}
