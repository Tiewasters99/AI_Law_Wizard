// Attorney Consultation Request by ID API Route

import { NextRequest } from "next/server";
import { handleGetConsultationRequest } from "@/lib/backend/controllers/attorney/consultationRequests/consultationRequestController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleGetConsultationRequest(request, id);
}

