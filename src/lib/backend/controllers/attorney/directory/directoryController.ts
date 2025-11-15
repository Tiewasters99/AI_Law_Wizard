// Controller for attorney directory API endpoint

import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import { getClientDirectory } from "../../../services/attorney/directory/directoryService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get client directory
 */
export async function handleGetDirectory(userId: string): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);
    const users = await getClientDirectory(userId);
    return successResponse({
      users,
      currentUserRole: "ATTORNEY",
      success: true,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch users");
  }
}
