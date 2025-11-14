// Controller for admin profile

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import { getAdminProfile } from "../../../services/admin/profile/profileService";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle GET admin profile request
 */
export async function handleGetProfile(request: NextRequest) {
  try {
    const admin = await requireAdminAuth(request);
    const profile = await getAdminProfile(admin.email);
    return successResponse(profile);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch admin profile");
  }
}

