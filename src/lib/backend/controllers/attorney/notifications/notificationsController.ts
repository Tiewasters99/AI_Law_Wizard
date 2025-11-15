// Controller for attorney notifications API endpoint

import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import { getUnreadNotificationCount } from "../../../services/attorney/notifications/notificationsService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get unread notification count
 */
export async function handleGetUnreadCount(userId: string): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);
    const count = await getUnreadNotificationCount(userId);
    return successResponse({
      count,
      success: true,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch unread count");
  }
}
