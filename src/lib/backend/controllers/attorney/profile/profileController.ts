// Controller for attorney profile API endpoints

import { NextRequest } from "next/server";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import {
  getAttorneyProfile,
  updateAttorneyProfile,
} from "../../../services/attorney/profile/profileService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get attorney profile
 */
export async function handleGetProfile(userId: string): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);
    const profile = await getAttorneyProfile(userId);
    return successResponse({ profile });
  } catch (error) {
    return errorResponse(error, "Failed to fetch profile");
  }
}

/**
 * Handle PUT request - Update attorney profile
 */
export async function handleUpdateProfile(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    const body = await request.json();
    const profile = await updateAttorneyProfile(userId, body);

    return successResponse({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    return errorResponse(error, "Failed to update profile");
  }
}
