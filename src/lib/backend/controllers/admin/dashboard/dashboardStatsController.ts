// Controller for admin dashboard statistics

import { NextRequest } from "next/server";
import {
  requireAdminAuth,
  getClientIP,
  getUserAgent,
} from "../../../utils/adminAuth";
import { getDashboardStats } from "../../../services/admin/dashboard/dashboardStatsService";
import { createAdminActivityLog } from "../../../repositories/admin/adminActivityRepository";
import { AdminAction } from "@/types/admin";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle GET dashboard stats request
 */
export async function handleGetDashboardStats(request: NextRequest) {
  try {
    const admin = await requireAdminAuth(request);
    const stats = await getDashboardStats();

    // Log the dashboard access
    await createAdminActivityLog({
      adminId: admin.id,
      action: "LOGIN" as AdminAction, // Using LOGIN as a generic admin action
      targetType: "Dashboard",
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      details: { action: "dashboard_stats_viewed" },
    });

    return successResponse(stats);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch dashboard statistics");
  }
}
