// Controller for admin feature check (public endpoint)

import { NextRequest } from "next/server";
import { checkFeatureStatus } from "../../../services/admin/features/featureCheckService";
import { successResponse, errorResponse } from "../../../utils/response";
import { ValidationError, AppError } from "../../../utils/errors";

/**
 * Handle POST feature check request (public - no auth required)
 */
export async function handleCheckFeature(request: NextRequest) {
  try {
    const body = await request.json();
    const { featureName, role } = body;

    if (!featureName || !role) {
      throw new ValidationError("featureName and role are required");
    }

    if (!["ATTORNEY", "CUSTOMER"].includes(role)) {
      throw new ValidationError("Invalid role");
    }

    const result = await checkFeatureStatus(featureName, role);

    return successResponse(result);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to check feature status");
  }
}

