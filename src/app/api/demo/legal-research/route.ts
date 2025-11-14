// Demo Legal Research API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { handleDemoLegalResearch } from "@/lib/backend/controllers/demo/legalResearchController";

export async function POST(request: NextRequest) {
  return handleDemoLegalResearch(request);
}
