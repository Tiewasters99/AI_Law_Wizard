// Controller for admin dashboard feature-wise spending

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import { getFeatureSpendingStats } from "../../../services/admin/dashboard/featureSpendingService";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle GET feature spending statistics request
 */
export async function handleGetFeatureSpending(request: NextRequest) {
  try {
    await requireAdminAuth(request);
    const stats = await getFeatureSpendingStats();
    return successResponse({ spending: stats });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch feature spending statistics");
  }
}

