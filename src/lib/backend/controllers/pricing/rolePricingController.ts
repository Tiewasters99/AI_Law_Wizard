// Controller for role-specific pricing API endpoint

import { NextRequest } from "next/server";
import { getRolePricingPackages } from "../../services/pricing/rolePricingService";
import { successResponse, errorResponse } from "../../utils/response";
import { ValidationError } from "../../utils/errors";
import { validateEnum } from "../../utils/validation";
import type { Role } from "@prisma/client";

/**
 * Handle GET request for role-specific pricing
 */
export async function handleGetRolePricing(
  request: NextRequest
): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get("role");

    if (!roleParam) {
      throw new ValidationError(
        "Valid role parameter is required (ATTORNEY or CUSTOMER)"
      );
    }

    // Validate role
    const role = validateEnum(
      roleParam,
      ["ATTORNEY", "CUSTOMER"] as const,
      "Role"
    ) as Role;

    // Call service
    const result = await getRolePricingPackages(role);
    return successResponse(result);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch role-specific pricing");
  }
}

