// Controller for admin dashboard activity

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import { getRecentActivity } from "../../../services/admin/dashboard/dashboardActivityService";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle GET dashboard activity request
 */
export async function handleGetDashboardActivity(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const activities = await getRecentActivity(limit);

    return successResponse(activities);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch activity data");
  }
}
