// Attorney Consultation Requests API Route

import { NextRequest } from "next/server";
import { handleListConsultationRequests } from "@/lib/backend/controllers/attorney/consultationRequests/consultationRequestController";

export async function GET(request: NextRequest) {
  return await handleListConsultationRequests(request);
}

