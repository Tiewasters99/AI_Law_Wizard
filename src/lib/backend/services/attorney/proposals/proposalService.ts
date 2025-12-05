// Service for attorney proposal functionality

import {
  createProposal,
  findProposalById,
  findProposalsByAttorneyId,
  findProposalsByConsultationRequestId,
  updateProposalStatus,
  updateProposal,
  deleteProposal,
  isProposalOwner,
} from "../../../repositories/attorney/proposalRepository";
import {
  findConsultationRequestByIdForAttorney,
} from "../../../repositories/attorney/consultationRequestRepository";
import { prisma } from "../../../prisma";
import { createNotification } from "../../../repositories/attorney/notificationRepository";
import { NotFoundError, ValidationError, AuthorizationError } from "../../../utils/errors";

export interface CreateProposalData {
  consultationRequestId: string;
  proposedFee: number;
  proposedTimeline: string;
  description: string;
  terms?: string;
}

/**
 * Create a new proposal
 */
export async function createAttorneyProposal(
  attorneyId: string,
  attorneyName: string,
  data: CreateProposalData
) {
  // Verify consultation request exists and belongs to this attorney
  const consultationRequest = await findConsultationRequestByIdForAttorney(
    data.consultationRequestId,
    attorneyId
  );

  if (!consultationRequest) {
    throw new NotFoundError("Consultation request not found");
  }

  // Validate proposal data
  if (!data.proposedFee || data.proposedFee <= 0) {
    throw new ValidationError("Proposed fee must be greater than 0");
  }

  if (!data.proposedTimeline || data.proposedTimeline.trim().length === 0) {
    throw new ValidationError("Proposed timeline is required");
  }

  if (!data.description || data.description.trim().length === 0) {
    throw new ValidationError("Description is required");
  }

  // Create proposal
  const proposal = await createProposal({
    consultationRequestId: data.consultationRequestId,
    attorneyId,
    clientId: consultationRequest.client.id,
    proposedFee: data.proposedFee,
    proposedTimeline: data.proposedTimeline,
    description: data.description,
    terms: data.terms,
  });

  // Update proposal status to SENT
  const sentProposal = await updateProposalStatus(proposal.id, "SENT");

  // Create notification for client
  await createNotification({
    userId: consultationRequest.client.id,
    type: "PROPOSAL_RECEIVED",
    title: "New Proposal Received",
    message: `You have received a proposal from ${attorneyName} for your consultation request`,
    relatedId: proposal.id,
  });

  return sentProposal;
}

/**
 * Get proposal by ID (with ownership check)
 */
export async function getAttorneyProposal(
  proposalId: string,
  attorneyId: string
) {
  const proposal = await findProposalById(proposalId);

  if (!proposal) {
    throw new NotFoundError("Proposal not found");
  }

  if (proposal.attorneyId !== attorneyId) {
    throw new AuthorizationError("Access denied");
  }

  return proposal;
}

/**
 * List attorney's proposals
 */
export async function listAttorneyProposals(
  attorneyId: string,
  status?: string
) {
  return await findProposalsByAttorneyId(attorneyId, status);
}

/**
 * Update proposal
 */
export async function updateAttorneyProposal(
  proposalId: string,
  attorneyId: string,
  data: {
    proposedFee?: number;
    proposedTimeline?: string;
    description?: string;
    terms?: string;
  }
) {
  // Verify ownership
  const isOwner = await isProposalOwner(proposalId, attorneyId);
  if (!isOwner) {
    throw new AuthorizationError("Access denied");
  }

  // Check if proposal can be updated (only DRAFT or SENT can be updated)
  const proposal = await findProposalById(proposalId);
  if (!proposal) {
    throw new NotFoundError("Proposal not found");
  }

  if (proposal.status !== "DRAFT" && proposal.status !== "SENT") {
    throw new ValidationError("Cannot update proposal in current status");
  }

  // Validate if updating fee
  if (data.proposedFee !== undefined && data.proposedFee <= 0) {
    throw new ValidationError("Proposed fee must be greater than 0");
  }

  return await updateProposal(proposalId, data);
}

/**
 * Withdraw proposal
 */
export async function withdrawProposal(
  proposalId: string,
  attorneyId: string
) {
  // Verify ownership
  const isOwner = await isProposalOwner(proposalId, attorneyId);
  if (!isOwner) {
    throw new AuthorizationError("Access denied");
  }

  // Check if proposal can be withdrawn
  const proposal = await findProposalById(proposalId);
  if (!proposal) {
    throw new NotFoundError("Proposal not found");
  }

  if (proposal.status === "ACCEPTED") {
    throw new ValidationError("Cannot withdraw an accepted proposal");
  }

  if (proposal.status === "WITHDRAWN") {
    throw new ValidationError("Proposal already withdrawn");
  }

  // Update status to WITHDRAWN
  const withdrawnProposal = await updateProposalStatus(proposalId, "WITHDRAWN");

  // Create notification for client
  await createNotification({
    userId: proposal.clientId,
    type: "PROPOSAL_REJECTED",
    title: "Proposal Withdrawn",
    message: `The proposal from ${proposal.attorney.name} has been withdrawn`,
    relatedId: proposalId,
  });

  return withdrawnProposal;
}

/**
 * Get proposals for a consultation request (for client)
 */
export async function getProposalsForRequest(
  consultationRequestId: string,
  clientId: string
) {
  // Verify consultation request belongs to client
  const consultationRequest = await prisma.consultationRequest.findFirst({
    where: {
      id: consultationRequestId,
      clientId,
    },
    select: { id: true },
  });

  if (!consultationRequest) {
    throw new NotFoundError("Consultation request not found");
  }

  return await findProposalsByConsultationRequestId(consultationRequestId);
}

/**
 * Accept proposal (client action)
 */
export async function acceptProposal(
  proposalId: string,
  clientId: string,
  clientName: string
) {
  const proposal = await findProposalById(proposalId);

  if (!proposal) {
    throw new NotFoundError("Proposal not found");
  }

  if (proposal.clientId !== clientId) {
    throw new AuthorizationError("Access denied");
  }

  if (proposal.status !== "SENT") {
    throw new ValidationError("Proposal cannot be accepted in current status");
  }

  // Update proposal status to ACCEPTED
  const acceptedProposal = await updateProposalStatus(proposalId, "ACCEPTED");

  // Update consultation request to link the accepted proposal
  await prisma.consultationRequest.update({
    where: { id: proposal.consultationRequestId },
    data: {
      proposalId: proposalId,
      status: "ACCEPTED",
    },
  });

  // Reject all other proposals for this request
  await prisma.proposal.updateMany({
    where: {
      consultationRequestId: proposal.consultationRequestId,
      id: { not: proposalId },
      status: "SENT",
    },
    data: {
      status: "REJECTED",
    },
  });

  // Create notification for attorney
  await createNotification({
    userId: proposal.attorneyId,
    type: "PROPOSAL_ACCEPTED",
    title: "Proposal Accepted",
    message: `${clientName} has accepted your proposal`,
    relatedId: proposalId,
  });

  return acceptedProposal;
}

/**
 * Reject proposal (client action)
 */
export async function rejectProposal(
  proposalId: string,
  clientId: string,
  clientName: string
) {
  const proposal = await findProposalById(proposalId);

  if (!proposal) {
    throw new NotFoundError("Proposal not found");
  }

  if (proposal.clientId !== clientId) {
    throw new AuthorizationError("Access denied");
  }

  if (proposal.status !== "SENT") {
    throw new ValidationError("Proposal cannot be rejected in current status");
  }

  // Update proposal status to REJECTED
  const rejectedProposal = await updateProposalStatus(proposalId, "REJECTED");

  // Create notification for attorney
  await createNotification({
    userId: proposal.attorneyId,
    type: "PROPOSAL_REJECTED",
    title: "Proposal Rejected",
    message: `${clientName} has rejected your proposal`,
    relatedId: proposalId,
  });

  return rejectedProposal;
}

