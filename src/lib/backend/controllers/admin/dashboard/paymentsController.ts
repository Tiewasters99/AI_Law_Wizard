// Controller for admin dashboard payment statistics

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import { getPayments } from "../../../services/admin/dashboard/paymentsService";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle GET payment statistics request
 */
export async function handleGetPayments(request: NextRequest) {
  try {
    await requireAdminAuth(request);
    const stats = await getPayments();
    return successResponse(stats);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch payment statistics");
  }
}
