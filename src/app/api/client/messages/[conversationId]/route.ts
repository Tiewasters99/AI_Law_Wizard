// Client Messages API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import {
  handleGetMessages,
  handleSendMessage,
} from "@/lib/backend/controllers/client/messages/messagesController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { conversationId } = await params;
  return handleGetMessages(conversationId, session?.user?.id || "");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { conversationId } = await params;
  return handleSendMessage(request, conversationId, session?.user?.id || "");
}
