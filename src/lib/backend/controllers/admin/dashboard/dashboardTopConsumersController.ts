// Controller for admin dashboard top consumers

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import { getTopTokenConsumers } from "../../../services/admin/dashboard/dashboardTopConsumersService";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle GET dashboard top consumers request
 */
export async function handleGetDashboardTopConsumers(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const consumers = await getTopTokenConsumers(limit);

    return successResponse(consumers);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch top consumers data");
  }
}
