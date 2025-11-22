// Attorney Reject Consultation Request API Route

import { NextRequest } from "next/server";
import { handleRejectConsultationRequest } from "@/lib/backend/controllers/attorney/consultationRequests/consultationRequestController";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleRejectConsultationRequest(request, id);
}

