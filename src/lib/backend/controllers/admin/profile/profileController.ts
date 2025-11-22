// Controller for admin profile

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import {
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
} from "../../../services/admin/profile/profileService";
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

/**
 * Handle PATCH admin profile update request
 */
export async function handleUpdateProfile(request: NextRequest) {
  try {
    const admin = await requireAdminAuth(request);
    const body = await request.json();
    const { name, email, image } = body;

    const updatedAdmin = await updateAdminProfile(admin.id, {
      name,
      email,
      image,
    });

    return successResponse(updatedAdmin);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to update admin profile");
  }
}

/**
 * Handle POST admin password update request
 */
export async function handleUpdatePassword(request: NextRequest) {
  try {
    const admin = await requireAdminAuth(request);
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return errorResponse(
        new AppError("Current password and new password are required", 400),
        "Failed to update password"
      );
    }

    await updateAdminPassword(admin.id, currentPassword, newPassword);

    return successResponse({ success: true, message: "Password updated successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to update password");
  }
}
