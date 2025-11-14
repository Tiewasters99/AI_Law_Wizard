// Controller for admin activity logs export

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import { exportActivityLogsAsCSV } from "../../../services/admin/logs/logsExportService";
import { LogFilters } from "../../../repositories/admin/adminActivityRepository";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle GET logs export request
 */
export async function handleExportLogs(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
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

    const csvContent = await exportActivityLogsAsCSV(filters);

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="admin-logs-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to export logs");
  }
}

