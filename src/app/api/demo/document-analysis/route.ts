// Demo Document Analysis API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { handleDemoDocumentAnalysis } from "@/lib/backend/controllers/demo/documentAnalysisController";

export async function POST(request: NextRequest) {
  return handleDemoDocumentAnalysis(request);
}
