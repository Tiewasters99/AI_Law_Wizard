// Client Reject Proposal API Route

import { NextRequest } from "next/server";
import { handleRejectProposal } from "@/lib/backend/controllers/client/proposals/proposalController";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleRejectProposal(request, id);
}

