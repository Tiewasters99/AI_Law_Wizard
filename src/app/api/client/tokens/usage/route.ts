// Client Token Usage API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleGetTokenUsage } from "@/lib/backend/controllers/client/tokens/tokenUsageController";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleGetTokenUsage(session?.user?.id || "");
}
