// Client Token Consumption API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleConsumeTokens } from "@/lib/backend/controllers/client/tokens/tokenConsumptionController";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  return handleConsumeTokens(request, session.user.id);
}
