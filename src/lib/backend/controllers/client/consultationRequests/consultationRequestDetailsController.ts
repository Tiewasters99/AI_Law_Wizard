// Controller for client consultation request details API endpoints

import { NextRequest } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import {
  getClientConsultationRequest,
  updateClientConsultationRequestStatus,
} from "../../../services/client/consultationRequests/consultationRequestsService";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateRequired } from "../../../utils/validation";
import { prisma } from "../../../prisma";

/**
 * Handle GET request - Get consultation request details
 */
export async function handleGetConsultationRequest(
  requestId: string,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const result = await getClientConsultationRequest(requestId, userId);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch consultation request");
  }
}

/**
 * Handle PATCH request - Update consultation request status
 */
export async function handleUpdateConsultationRequestStatus(
  request: NextRequest,
  requestId: string,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const body = await request.json();
    const { status } = body;

    validateRequired(status, "Status");

    // Get client name
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    const clientName = user?.name || "a client";

    const result = await updateClientConsultationRequestStatus(
      requestId,
      userId,
      clientName,
      status
    );

    return successResponse({
      success: true,
      request: result.request,
      message: "Consultation request updated successfully",
    });
  } catch (error) {
    return errorResponse(error, "Failed to update consultation request");
  }
}

