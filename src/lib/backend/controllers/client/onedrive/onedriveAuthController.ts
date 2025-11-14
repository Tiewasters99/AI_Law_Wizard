// Controller for client OneDrive authentication API endpoints

import { NextRequest } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import { generateClientOneDriveAuthUrl } from "../../../services/client/onedrive/onedriveAuthService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get OneDrive authentication URL
 */
export async function handleGetClientOneDriveAuthUrl(
  request: NextRequest,
  userId: string | undefined
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const result = generateClientOneDriveAuthUrl();

    return successResponse({
      authUrl: result.authUrl,
    });
  } catch (error) {
    return errorResponse(error, "Failed to generate auth URL");
  }
}

