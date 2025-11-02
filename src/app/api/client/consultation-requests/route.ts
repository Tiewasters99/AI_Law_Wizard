// Client Consultation Requests API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import {
  handleCreateConsultationRequest,
  handleListConsultationRequests,
} from "@/lib/backend/controllers/client/consultationRequests/consultationRequestsController";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleCreateConsultationRequest(request, session?.user?.id || "");
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleListConsultationRequests(request, session?.user?.id || "");
}
