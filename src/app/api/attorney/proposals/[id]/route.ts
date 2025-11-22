// Attorney Proposal by ID API Route

import { NextRequest } from "next/server";
import {
  handleGetProposal,
  handleUpdateProposal,
  handleWithdrawProposal,
} from "@/lib/backend/controllers/attorney/proposals/proposalController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleGetProposal(request, id);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleUpdateProposal(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleWithdrawProposal(request, id);
}

