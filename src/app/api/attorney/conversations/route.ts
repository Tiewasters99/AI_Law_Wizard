// Attorney Conversations API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleGetConversations } from "@/lib/backend/controllers/attorney/conversations/conversationsController";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleGetConversations(session?.user?.id || "");
}
