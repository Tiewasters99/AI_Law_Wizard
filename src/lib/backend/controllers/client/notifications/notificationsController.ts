// Controller for client notifications API endpoints

import { verifyClientAccess } from "../../../utils/clientAuth";
import { getClientUnreadCounts } from "../../../services/client/notifications/notificationsService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get unread notification counts
 */
export async function handleGetUnreadCounts(
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const result = await getClientUnreadCounts(userId);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch notification counts");
  }
}

