// Controller for admin management

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import { listAdmins } from "../../../services/admin/admins/adminsService";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle GET admins list request
 */
export async function handleListAdmins(request: NextRequest) {
  try {
    await requireAdminAuth(request);
    const admins = await listAdmins();
    return successResponse(admins);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch admins");
  }
}

