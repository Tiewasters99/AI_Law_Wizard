// Attorney Notifications Unread Count API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleGetUnreadCount } from "@/lib/backend/controllers/attorney/notifications/notificationsController";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleGetUnreadCount(session?.user?.id || "");
}
