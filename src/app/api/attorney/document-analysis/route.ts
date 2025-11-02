// Attorney Document Analysis API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import {
  handleDocumentAnalysis,
  handleGetDocumentAnalysisHistory,
} from "@/lib/backend/controllers/attorney/documentAnalysis/documentAnalysisController";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleDocumentAnalysis(request, session?.user?.id || "");
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleGetDocumentAnalysisHistory(request, session?.user?.id || "");
}
