// Client Get Proposals for Consultation Request API Route

import { NextRequest } from "next/server";
import { handleGetProposalsForRequest } from "@/lib/backend/controllers/client/proposals/proposalController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleGetProposalsForRequest(request, id);
}
