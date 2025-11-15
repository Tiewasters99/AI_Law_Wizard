// Controller for OneDrive authentication API endpoint

import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import { generateOneDriveAuthUrl } from "../../../services/attorney/onedrive/onedriveAuthService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get OneDrive auth URL
 */
export async function handleGetOneDriveAuthUrl(
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);
    const result = generateOneDriveAuthUrl();
    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to generate auth URL");
  }
}
