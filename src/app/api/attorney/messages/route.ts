// Attorney Messages API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleSendMessage } from "@/lib/backend/controllers/attorney/messages/messagesController";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleSendMessage(request, session?.user?.id || "");
}
