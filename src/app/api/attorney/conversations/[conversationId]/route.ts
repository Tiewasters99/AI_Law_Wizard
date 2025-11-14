// Attorney Conversation Messages API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleGetConversationMessages } from "@/lib/backend/controllers/attorney/conversations/conversationMessagesController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { conversationId } = await params;
  return handleGetConversationMessages(conversationId, session?.user?.id || "");
}
