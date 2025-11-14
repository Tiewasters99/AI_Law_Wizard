// Attorney Query History API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleGetQueryHistory } from "@/lib/backend/controllers/attorney/queryHistory/queryHistoryController";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleGetQueryHistory(request, session?.user?.id || "");
}
