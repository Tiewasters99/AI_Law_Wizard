// Controller for admin dashboard token usage

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import { getConsumptionTrends } from "../../../services/admin/dashboard/dashboardTokenUsageService";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle GET dashboard token usage request
 */
export async function handleGetDashboardTokenUsage(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const range =
      (searchParams.get("range") as "7d" | "30d" | "90d" | "1y") || "30d";

    let days = 30;
    switch (range) {
      case "7d":
        days = 7;
        break;
      case "30d":
        days = 30;
        break;
      case "90d":
        days = 90;
        break;
      case "1y":
        days = 365;
        break;
    }

    const trends = await getConsumptionTrends(days);

    return successResponse(trends);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch token usage data");
  }
}
