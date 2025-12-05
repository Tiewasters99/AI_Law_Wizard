// Controller for attorney consultation request API endpoints

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import {
  listAttorneyConsultationRequests,
  getAttorneyConsultationRequest,
  acceptConsultationRequest,
  rejectConsultationRequest,
} from "../../../services/attorney/consultationRequests/consultationRequestService";
import { successResponse, errorResponse } from "../../../utils/response";
import { prisma } from "../../../prisma";

/**
 * Handle GET request - List consultation requests
 */
export async function handleListConsultationRequests(
  request: NextRequest
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new Error("Unauthorized"), "Authentication required");
    }

    await verifyAttorneyAccess(session.user.id);

    const result = await listAttorneyConsultationRequests(session.user.id);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch consultation requests");
  }
}

/**
 * Handle GET request - Get consultation request by ID
 */
export async function handleGetConsultationRequest(
  request: NextRequest,
  requestId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new Error("Unauthorized"), "Authentication required");
    }

    await verifyAttorneyAccess(session.user.id);

    const result = await getAttorneyConsultationRequest(
      requestId,
      session.user.id
    );

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch consultation request");
  }
}

/**
 * Handle POST request - Accept consultation request
 */
export async function handleAcceptConsultationRequest(
  request: NextRequest,
  requestId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new Error("Unauthorized"), "Authentication required");
    }

    await verifyAttorneyAccess(session.user.id);

    // Get attorney name
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });
    const attorneyName = user?.name || "an attorney";

    const result = await acceptConsultationRequest(
      requestId,
      session.user.id,
      attorneyName
    );

    return successResponse({
      success: true,
      ...result,
      message: "Consultation request accepted successfully",
    });
  } catch (error) {
    return errorResponse(error, "Failed to accept consultation request");
  }
}

/**
 * Handle POST request - Reject consultation request
 */
export async function handleRejectConsultationRequest(
  request: NextRequest,
  requestId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new Error("Unauthorized"), "Authentication required");
    }

    await verifyAttorneyAccess(session.user.id);

    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // Get attorney name
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });
    const attorneyName = user?.name || "an attorney";

    const result = await rejectConsultationRequest(
      requestId,
      session.user.id,
      attorneyName,
      reason
    );

    return successResponse({
      success: true,
      ...result,
      message: "Consultation request rejected successfully",
    });
  } catch (error) {
    return errorResponse(error, "Failed to reject consultation request");
  }
}

