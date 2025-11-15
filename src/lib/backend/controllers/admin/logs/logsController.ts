// Controller for admin activity logs

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import { getActivityLogs } from "../../../services/admin/logs/logsService";
import { LogFilters } from "../../../repositories/admin/adminActivityRepository";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle GET logs request
 */
export async function handleGetLogs(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const action = searchParams.get("action") || "";
    const dateRange = searchParams.get("dateRange") as
      | "today"
      | "week"
      | "month"
      | "year"
      | "";
    const adminId = searchParams.get("adminId") || "";

    const filters: LogFilters = {};
    if (search) filters.search = search;
    if (action) filters.action = action;
    if (dateRange) filters.dateRange = dateRange;
    if (adminId) filters.adminId = adminId;

    const result = await getActivityLogs(filters, page, limit);

    return successResponse(result);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch logs");
  }
}
