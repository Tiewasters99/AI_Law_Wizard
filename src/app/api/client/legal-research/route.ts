// Client Legal Research API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleLegalResearch } from "@/lib/backend/controllers/client/legalResearch/legalResearchController";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleLegalResearch(request, session?.user?.id || "");
}
