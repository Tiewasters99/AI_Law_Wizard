// Guest Legal Research API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { handleGuestLegalResearch } from "@/lib/backend/controllers/guest/legalResearchController";

export async function POST(request: NextRequest) {
  return handleGuestLegalResearch(request);
}
