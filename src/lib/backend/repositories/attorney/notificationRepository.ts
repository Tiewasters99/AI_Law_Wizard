// Repository for notification database operations

import { prisma } from "../../prisma";

/**
 * Count unread notifications for a user
 */
export async function countUnreadNotifications(
  userId: string
): Promise<number> {
  return await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

/**
 * Create a notification
 */
export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string | null;
}) {
  return await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type as any, // NotificationType enum - will be validated at runtime
      title: data.title,
      message: data.message,
      relatedId: data.relatedId || null,
      isRead: false,
    },
  });
}
