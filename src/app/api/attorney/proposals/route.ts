// Attorney Proposals API Route

import { NextRequest } from "next/server";
import {
  handleCreateProposal,
  handleListProposals,
} from "@/lib/backend/controllers/attorney/proposals/proposalController";

export async function POST(request: NextRequest) {
  return await handleCreateProposal(request);
}

export async function GET(request: NextRequest) {
  return await handleListProposals(request);
}

