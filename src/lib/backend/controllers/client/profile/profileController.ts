// Controller for client profile API endpoints

import { NextRequest } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import {
  getClientProfile,
  updateClientProfile,
} from "../../../services/client/profile/profileService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get client profile
 */
export async function handleGetProfile(userId: string): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const profile = await getClientProfile(userId);

    return successResponse(profile);
  } catch (error) {
    return errorResponse(error, "Failed to fetch profile");
  }
}

/**
 * Handle PATCH request - Update client profile
 */
export async function handleUpdateProfile(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const body = await request.json();
    const { name, phone, company, industry, location, bio } = body;

    const user = await updateClientProfile(userId, {
      name,
      phone,
      company,
      industry,
      location,
      bio,
    });

    return successResponse({
      success: true,
      user,
    });
  } catch (error) {
    return errorResponse(error, "Failed to update profile");
  }
}

