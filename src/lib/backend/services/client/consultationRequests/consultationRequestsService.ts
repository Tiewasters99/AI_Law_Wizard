// Service for client consultation requests functionality

import { prisma } from "../../../prisma";
import { deductTokens } from "../../../tokenService";
import {
  findConsultationRequestsByClientId,
  findConsultationRequestByIdForClient,
  updateConsultationRequestStatus,
  createConsultationRequest,
  markConsultationRequestAsViewedByClient,
  updateConsultationRequestFields,
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

  // Create consultation request only (no conversation until attorney accepts)
  const consultationRequest = await createConsultationRequest({
    clientId,
    attorneyId: data.attorneyId,
    caseType: data.caseType,
    urgency: data.urgency,
    description: data.description,
    documents: data.attachmentUrls || [],
  });

  // Create notification for attorney
  await createNotification({
    userId: data.attorneyId,
    type: "NEW_REQUEST",
    title: "New Consultation Request",
    message: `You have a new ${data.urgency} priority consultation request from ${clientName}`,
    relatedId: consultationRequest.id,
  });

  return {
    consultationRequest,
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
export async function markRequestAsViewed(requestId: string, clientId: string) {
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

export interface UpdateConsultationRequestFieldsData {
  caseType?: string;
  urgency?: string;
  description?: string;
  attachmentUrls?: string[];
}

/**
 * Update consultation request fields (caseType, urgency, description, attachments)
 * Cannot update if status is ACCEPTED
 */
export async function updateClientConsultationRequestFields(
  requestId: string,
  clientId: string,
  data: UpdateConsultationRequestFieldsData
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

  // Cannot edit if status is ACCEPTED
  if (consultationRequest.status === "ACCEPTED") {
    throw new ValidationError(
      "Cannot edit consultation request that has been accepted"
    );
  }

  // Validate required fields if provided
  if (data.caseType !== undefined && !data.caseType.trim()) {
    throw new ValidationError("Case type is required");
  }

  if (data.description !== undefined && !data.description.trim()) {
    throw new ValidationError("Description is required");
  }

  // Validate urgency if provided
  if (data.urgency !== undefined) {
    const validUrgencies = ["low", "medium", "high", "urgent"];
    if (!validUrgencies.includes(data.urgency.toLowerCase())) {
      throw new ValidationError("Invalid urgency level");
    }
  }

  // Prepare update data
  const updateData: {
    caseType?: string;
    urgency?: string;
    description?: string;
    documents?: string[];
  } = {};

  if (data.caseType !== undefined) {
    updateData.caseType = data.caseType.trim();
  }

  if (data.urgency !== undefined) {
    updateData.urgency = data.urgency;
  }

  if (data.description !== undefined) {
    updateData.description = data.description.trim();
  }

  if (data.attachmentUrls !== undefined) {
    updateData.documents = data.attachmentUrls;
  }

  // Update consultation request
  const updatedRequest = await updateConsultationRequestFields(
    requestId,
    updateData
  );

  return { request: updatedRequest };
}
