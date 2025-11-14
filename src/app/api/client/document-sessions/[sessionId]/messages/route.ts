// Client Document Session Messages API Route

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleGetSessionMessages } from "@/lib/backend/controllers/client/documentAnalysis/documentSessionController";

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
  return handleGetSessionMessages(request, session.user.id, sessionId);
}
