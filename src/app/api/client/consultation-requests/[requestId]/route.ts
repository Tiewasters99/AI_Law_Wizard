// Client Consultation Request Details API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import {
  handleGetConsultationRequest,
  handleUpdateConsultationRequestStatus,
} from "@/lib/backend/controllers/client/consultationRequests/consultationRequestDetailsController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { requestId } = await params;
  return handleGetConsultationRequest(requestId, session?.user?.id || "");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { requestId } = await params;
  return handleUpdateConsultationRequestStatus(
    request,
    requestId,
    session?.user?.id || ""
  );
}
