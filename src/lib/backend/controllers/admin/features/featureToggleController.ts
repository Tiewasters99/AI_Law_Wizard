// Controller for admin feature toggle

import { NextRequest } from "next/server";
import { requireAdminAuth, getClientIP, getUserAgent } from "../../../utils/adminAuth";
import { toggleFeature } from "../../../services/admin/features/featureToggleService";
import { successResponse, errorResponse } from "../../../utils/response";
import { ValidationError, AppError } from "../../../utils/errors";

/**
 * Handle PUT feature toggle request
 */
export async function handleToggleFeature(
  request: NextRequest,
  featureId: string
) {
  try {
    const admin = await requireAdminAuth(request);

    const body = await request.json();
    const { isEnabled, role } = body;

    if (typeof isEnabled !== "boolean") {
      throw new ValidationError("isEnabled must be a boolean");
    }

    const updatedFeature = await toggleFeature(
      featureId,
      isEnabled,
      role,
      admin.id
    );

    return successResponse(updatedFeature);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to toggle feature");
  }
}

