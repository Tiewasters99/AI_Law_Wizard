// Controller for admin role pricing

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import { getRolePricing } from "../../../services/admin/pricing/rolePricingService";
import { successResponse, errorResponse } from "../../../utils/response";
import { ValidationError, AppError } from "../../../utils/errors";

/**
 * Handle GET role pricing request
 */
export async function handleGetRolePricing(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get("packageId");
    const role = searchParams.get("role") as "ATTORNEY" | "CUSTOMER" | null;

    if (!packageId || !role) {
      throw new ValidationError("packageId and role are required");
    }

    if (!["ATTORNEY", "CUSTOMER"].includes(role)) {
      throw new ValidationError("Invalid role");
    }

    const result = await getRolePricing(packageId, role);

    return successResponse(result);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to check role pricing");
  }
}

