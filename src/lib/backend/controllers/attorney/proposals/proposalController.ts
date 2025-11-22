// Controller for attorney proposal API endpoints

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import {
  createAttorneyProposal,
  getAttorneyProposal,
  listAttorneyProposals,
  updateAttorneyProposal,
  withdrawProposal,
} from "../../../services/attorney/proposals/proposalService";
import { successResponse, errorResponse } from "../../../utils/response";
import {
  validateRequired,
  validateNonEmptyString,
} from "../../../utils/validation";
import { prisma } from "../../../prisma";

/**
 * Handle POST request - Create proposal
 */
export async function handleCreateProposal(
  request: NextRequest
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new Error("Unauthorized"), "Authentication required");
    }

    await verifyAttorneyAccess(session.user.id);

    const body = await request.json();
    const {
      consultationRequestId,
      proposedFee,
      proposedTimeline,
      description,
      terms,
    } = body;

    validateRequired(consultationRequestId, "Consultation request ID");
    validateRequired(proposedFee, "Proposed fee");
    validateRequired(proposedTimeline, "Proposed timeline");
    validateRequired(description, "Description");
    validateNonEmptyString(description, "Description");

    // Validate proposed fee
    if (typeof proposedFee !== "number" || proposedFee <= 0) {
      return errorResponse(
        new Error("Proposed fee must be a positive number"),
        "Validation error"
      );
    }

    // Get attorney name
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });
    const attorneyName = user?.name || "an attorney";

    const proposal = await createAttorneyProposal(
      session.user.id,
      attorneyName,
      {
        consultationRequestId,
        proposedFee,
        proposedTimeline,
        description,
        terms,
      }
    );

    return successResponse({
      success: true,
      proposal,
      message: "Proposal created successfully",
    });
  } catch (error) {
    return errorResponse(error, "Failed to create proposal");
  }
}

/**
 * Handle GET request - List proposals
 */
export async function handleListProposals(
  request: NextRequest
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new Error("Unauthorized"), "Authentication required");
    }

    await verifyAttorneyAccess(session.user.id);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const proposals = await listAttorneyProposals(
      session.user.id,
      status || undefined
    );

    return successResponse({
      success: true,
      proposals,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch proposals");
  }
}

/**
 * Handle GET request - Get proposal by ID
 */
export async function handleGetProposal(
  request: NextRequest,
  proposalId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new Error("Unauthorized"), "Authentication required");
    }

    await verifyAttorneyAccess(session.user.id);

    const proposal = await getAttorneyProposal(proposalId, session.user.id);

    return successResponse({
      success: true,
      proposal,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch proposal");
  }
}

/**
 * Handle PATCH request - Update proposal
 */
export async function handleUpdateProposal(
  request: NextRequest,
  proposalId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new Error("Unauthorized"), "Authentication required");
    }

    await verifyAttorneyAccess(session.user.id);

    const body = await request.json();
    const { proposedFee, proposedTimeline, description, terms } = body;

    const updateData: any = {};
    if (proposedFee !== undefined) updateData.proposedFee = proposedFee;
    if (proposedTimeline !== undefined)
      updateData.proposedTimeline = proposedTimeline;
    if (description !== undefined) updateData.description = description;
    if (terms !== undefined) updateData.terms = terms;

    const proposal = await updateAttorneyProposal(
      proposalId,
      session.user.id,
      updateData
    );

    return successResponse({
      success: true,
      proposal,
      message: "Proposal updated successfully",
    });
  } catch (error) {
    return errorResponse(error, "Failed to update proposal");
  }
}

/**
 * Handle DELETE request - Withdraw proposal
 */
export async function handleWithdrawProposal(
  request: NextRequest,
  proposalId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new Error("Unauthorized"), "Authentication required");
    }

    await verifyAttorneyAccess(session.user.id);

    const proposal = await withdrawProposal(proposalId, session.user.id);

    return successResponse({
      success: true,
      proposal,
      message: "Proposal withdrawn successfully",
    });
  } catch (error) {
    return errorResponse(error, "Failed to withdraw proposal");
  }
}

