// Controller for client proposal API endpoints

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { verifyClientAccess } from "../../../utils/clientAuth";
import {
  getProposalsForRequest,
  acceptProposal,
  rejectProposal,
} from "../../../services/attorney/proposals/proposalService";
import { successResponse, errorResponse } from "../../../utils/response";
import { prisma } from "../../../prisma";

/**
 * Handle GET request - Get proposals for a consultation request
 */
export async function handleGetProposalsForRequest(
  request: NextRequest,
  consultationRequestId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new Error("Unauthorized"), "Authentication required");
    }

    await verifyClientAccess(session.user.id);

    const proposals = await getProposalsForRequest(
      consultationRequestId,
      session.user.id
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
 * Handle POST request - Accept proposal
 */
export async function handleAcceptProposal(
  request: NextRequest,
  proposalId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new Error("Unauthorized"), "Authentication required");
    }

    await verifyClientAccess(session.user.id);

    // Get client name
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });
    const clientName = user?.name || "a client";

    const proposal = await acceptProposal(proposalId, session.user.id, clientName);

    return successResponse({
      success: true,
      proposal,
      message: "Proposal accepted successfully",
    });
  } catch (error) {
    return errorResponse(error, "Failed to accept proposal");
  }
}

/**
 * Handle POST request - Reject proposal
 */
export async function handleRejectProposal(
  request: NextRequest,
  proposalId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new Error("Unauthorized"), "Authentication required");
    }

    await verifyClientAccess(session.user.id);

    // Get client name
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });
    const clientName = user?.name || "a client";

    const proposal = await rejectProposal(proposalId, session.user.id, clientName);

    return successResponse({
      success: true,
      proposal,
      message: "Proposal rejected successfully",
    });
  } catch (error) {
    return errorResponse(error, "Failed to reject proposal");
  }
}

