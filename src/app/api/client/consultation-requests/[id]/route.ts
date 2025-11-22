// Client Consultation Request Details API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import {
  handleGetConsultationRequest,
  handleUpdateConsultationRequest,
} from "@/lib/backend/controllers/client/consultationRequests/consultationRequestDetailsController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  return handleGetConsultationRequest(id, session?.user?.id || "");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  return handleUpdateConsultationRequest(request, id, session?.user?.id || "");
}
