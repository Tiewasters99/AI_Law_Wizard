// Controller for Stripe payment intent API endpoint

import { NextRequest } from "next/server";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import { createPaymentIntent } from "../../../services/attorney/stripe/stripePaymentService";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateRequired } from "../../../utils/validation";

/**
 * Handle POST request - Create payment intent
 */
export async function handleCreatePaymentIntent(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    const body = await request.json();
    const { packageId } = body;

    validateRequired(packageId, "Package ID");

    const result = await createPaymentIntent(userId, packageId);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to create payment intent");
  }
}

