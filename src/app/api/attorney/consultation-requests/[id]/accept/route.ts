// Attorney Accept Consultation Request API Route

import { NextRequest } from "next/server";
import { handleAcceptConsultationRequest } from "@/lib/backend/controllers/attorney/consultationRequests/consultationRequestController";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleAcceptConsultationRequest(request, id);
}

