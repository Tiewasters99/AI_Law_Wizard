// Service for client notifications functionality

import { countUnreadNotifications } from "../../../repositories/attorney/notificationRepository";
import { countUnreadMessagesForClient } from "../../../repositories/attorney/messageRepository";
import { countPendingConsultationRequestsForClient } from "../../../repositories/attorney/consultationRequestRepository";

/**
 * Get unread notification counts for a client
 */
export async function getClientUnreadCounts(clientId: string) {
  const [notifications, messages, pendingRequests] = await Promise.all([
    countUnreadNotifications(clientId),
    countUnreadMessagesForClient(clientId),
    countPendingConsultationRequestsForClient(clientId),
  ]);

  return {
    notifications,
    messages,
    pendingRequests,
    total: notifications + messages + pendingRequests,
  };
}

