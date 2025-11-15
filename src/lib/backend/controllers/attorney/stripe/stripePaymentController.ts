// Controller for Stripe payment intent API endpoint

import { NextRequest } from "next/server";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import { createPaymentIntent } from "../../../services/attorney/stripe/stripePaymentService";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateRequired } from "../../../utils/validation";
import type { Role } from "@prisma/client";

/**
 * Handle POST request - Create payment intent
 */
export async function handleCreatePaymentIntent(
  request: NextRequest,
  userId: string,
  userRole?: Role
): Promise<Response> {
  try {
    const user = await verifyAttorneyAccess(userId);
    const role = (userRole || user.role) as Role;

    // Ensure role is ATTORNEY
    if (role !== "ATTORNEY") {
      throw new Error("Attorney role required");
    }

    const body = await request.json();
    const { packageId } = body;

    validateRequired(packageId, "Package ID");

    const result = await createPaymentIntent(userId, packageId, role);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to create payment intent");
  }
}
