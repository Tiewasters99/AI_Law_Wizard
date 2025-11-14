// Controller for admin features

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import { listFeatures } from "../../../services/admin/features/featuresService";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle GET features list request
 */
export async function handleListFeatures(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") as "ATTORNEY" | "CUSTOMER" | null;

    const features = await listFeatures(role);

    return successResponse(features);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch features");
  }
}

