// Service for attorney notifications functionality

import { countUnreadNotifications } from "../../../repositories/attorney/notificationRepository";

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string) {
  return await countUnreadNotifications(userId);
}

