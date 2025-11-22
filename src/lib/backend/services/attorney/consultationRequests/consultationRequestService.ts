// Service for attorney consultation request functionality

import {
  findConsultationRequestsByAttorneyId,
  findConsultationRequestByIdForAttorney,
  updateConsultationRequestStatus,
} from "../../../repositories/attorney/consultationRequestRepository";
import { createNotification } from "../../../repositories/attorney/notificationRepository";
import { createMessage } from "../../../repositories/attorney/messageRepository";
import { updateConversationOnNewMessage } from "../../../repositories/attorney/conversationRepository";
import { NotFoundError, ValidationError, AuthorizationError } from "../../../utils/errors";
import { prisma } from "../../../prisma";

/**
 * List consultation requests for attorney
 */
export async function listAttorneyConsultationRequests(attorneyId: string) {
  const requests = await findConsultationRequestsByAttorneyId(attorneyId);
  return {
    requests,
    total: requests.length,
  };
}

/**
 * Get consultation request by ID for attorney
 */
export async function getAttorneyConsultationRequest(
  requestId: string,
  attorneyId: string
) {
  const request = await findConsultationRequestByIdForAttorney(
    requestId,
    attorneyId
  );

  if (!request) {
    throw new NotFoundError("Consultation request not found");
  }

  return { request };
}

/**
 * Accept consultation request
 */
export async function acceptConsultationRequest(
  requestId: string,
  attorneyId: string,
  attorneyName: string
) {
  const request = await findConsultationRequestByIdForAttorney(
    requestId,
    attorneyId
  );

  if (!request) {
    throw new NotFoundError("Consultation request not found");
  }

  if (request.status !== "PENDING") {
    throw new ValidationError("Request cannot be accepted in current status");
  }

  // Update request status
  const updatedRequest = await updateConsultationRequestStatus(
    requestId,
    "ACCEPTED"
  );

  // Get clientId from the request - need to fetch full request to get clientId
  const fullRequest = await prisma.consultationRequest.findUnique({
    where: { id: requestId },
    select: { clientId: true },
  });
  
  if (!fullRequest) {
    throw new NotFoundError("Consultation request not found");
  }

  // Create conversation if it doesn't exist (conversation is only created when attorney accepts)
  let conversation = request.conversation;
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        clientId: fullRequest.clientId,
        attorneyId: attorneyId,
        consultationRequestId: requestId,
        unreadByClient: 0,
        unreadByAttorney: 0,
      },
    });
  }

  // Create system message in conversation
  const systemMessage = await createMessage({
    conversationId: conversation.id,
    senderId: attorneyId,
    content: `${attorneyName} has accepted your consultation request`,
  });

  // Update conversation with last message and increment unread count for client
  await updateConversationOnNewMessage(conversation.id, true);

  // Create notification for client
  await createNotification({
    userId: fullRequest.clientId,
    type: "REQUEST_ACCEPTED",
    title: "Consultation Request Accepted",
    message: `${attorneyName} has accepted your consultation request`,
    relatedId: conversation.id,
  });

  return { request: updatedRequest };
}

/**
 * Reject consultation request
 */
export async function rejectConsultationRequest(
  requestId: string,
  attorneyId: string,
  attorneyName: string,
  reason?: string
) {
  const request = await findConsultationRequestByIdForAttorney(
    requestId,
    attorneyId
  );

  if (!request) {
    throw new NotFoundError("Consultation request not found");
  }

  if (request.status !== "PENDING") {
    throw new ValidationError("Request cannot be rejected in current status");
  }

  // Update request status
  const updatedRequest = await updateConsultationRequestStatus(
    requestId,
    "REJECTED"
  );

  // Create notification for client
  await createNotification({
    userId: request.client.id,
    type: "REQUEST_REJECTED",
    title: "Consultation Request Rejected",
    message: `${attorneyName} has rejected your consultation request${reason ? `: ${reason}` : ""}`,
    relatedId: request.conversation?.id || null,
  });

  return { request: updatedRequest };
}

