// Controller for client token consumption API endpoints

import { NextRequest } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import { consumeTokens } from "../../../services/client/tokens/tokenConsumptionService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle POST request - Consume tokens
 */
export async function handleConsumeTokens(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const body = await request.json();
    const { amount, description, feature, metadata } = body;

    // Validate required fields
    if (!amount || !description) {
      return errorResponse(
        new Error("Amount and description are required"),
        "Invalid request"
      );
    }

    const result = await consumeTokens(userId, {
      amount,
      description,
      feature,
      metadata,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to consume tokens");
  }
}
