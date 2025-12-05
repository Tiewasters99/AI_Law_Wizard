// Client Chat Messages API Route

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleGetChatMessages } from "@/lib/backend/controllers/client/chat/chatController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  const { sessionId } = await params;
  return handleGetChatMessages(request, session.user.id, sessionId);
}
