// Client Document Session by ID API Route

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import {
  handleUpdateSession,
} from "@/lib/backend/controllers/client/documentAnalysis/documentSessionController";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401 }
    );
  }
  return handleUpdateSession(request, session.user.id, params.sessionId);
}

