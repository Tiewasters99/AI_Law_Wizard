// Attorney Messages Unread Count API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleGetUnreadMessageCount } from "@/lib/backend/controllers/attorney/messages/messagesController";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleGetUnreadMessageCount(session?.user?.id || "");
}
