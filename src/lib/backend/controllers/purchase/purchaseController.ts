// Controller for purchase API endpoint

import { NextRequest } from "next/server";
import { preparePurchase } from "../../services/purchase/purchaseService";
import { successResponse, errorResponse, authenticationErrorResponse } from "../../utils/response";
import { ValidationError, NotFoundError } from "../../utils/errors";
import { validateRequired, validateEnum } from "../../utils/validation";
import type { Role } from "@prisma/client";

/**
 * Handle POST request for purchase
 */
export async function handlePurchase(
  request: NextRequest,
  userEmail: string | null
): Promise<Response> {
  try {
    // Check authentication
    if (!userEmail) {
      return authenticationErrorResponse("Authentication required");
    }

    const body = await request.json();
    const { packageId, role } = body;

    // Validate input
    const validatedPackageId = validateRequired(packageId, "Package ID");
    const validatedRole = validateEnum(
      role,
      ["ATTORNEY", "CUSTOMER"] as const,
      "Role"
    ) as Role;

    // Call service
    const result = await preparePurchase({
      packageId: validatedPackageId,
      role: validatedRole,
      userEmail,
    });

    return successResponse(result);
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof Error
    ) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to prepare purchase");
  }
}

