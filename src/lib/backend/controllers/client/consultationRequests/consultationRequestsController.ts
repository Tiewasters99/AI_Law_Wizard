// Controller for client consultation requests API endpoints

import { NextRequest, NextResponse } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import {
  createClientConsultationRequest,
  listClientConsultationRequests,
  markRequestAsViewed,
} from "../../../services/client/consultationRequests/consultationRequestsService";
import { successResponse, errorResponse } from "../../../utils/response";
import {
  validateRequired,
  validateEnum,
  validateNonEmptyString,
} from "../../../utils/validation";
import { prisma } from "../../../prisma";

/**
 * Handle POST request - Create consultation request
 */
export async function handleCreateConsultationRequest(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const body = await request.json();
    const { attorneyId, caseType, urgency, description, attachmentUrls } = body;

    validateRequired(attorneyId, "Attorney ID");
    validateRequired(caseType, "Case type");
    validateRequired(description, "Description");
    validateNonEmptyString(description, "Description");

    // Validate urgency
    const validUrgencyLevels = ["low", "medium", "high", "urgent"];
    validateEnum(urgency, validUrgencyLevels, "Urgency level");

    // Get client name
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    const clientName = user?.name || "a client";

    const result = await createClientConsultationRequest(userId, clientName, {
      attorneyId,
      caseType,
      urgency,
      description,
      attachmentUrls,
    });

    return successResponse({
      success: true,
      consultationRequest: result.consultationRequest,
      conversation: result.conversation,
      initialMessage: result.initialMessage,
      tokenBalance: result.tokenBalance,
      message: "Consultation request sent successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Insufficient")) {
      // Return 402 Payment Required for insufficient tokens
      return NextResponse.json(
        {
          error: error.message,
          code: "INSUFFICIENT_TOKENS",
        },
        { status: 402 }
      );
    }
    return errorResponse(error, "Failed to create consultation request");
  }
}

/**
 * Handle GET request - List consultation requests
 */
export async function handleListConsultationRequests(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const result = await listClientConsultationRequests(
      userId,
      status || undefined
    );

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch consultation requests");
  }
}

/**
 * Handle POST request - Mark consultation request as viewed
 */
export async function handleMarkRequestAsViewed(
  request: NextRequest,
  requestId: string,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const result = await markRequestAsViewed(requestId, userId);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to mark request as viewed");
  }
}
