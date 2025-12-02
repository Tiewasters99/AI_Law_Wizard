// API route for rejecting an invitation

import { NextRequest } from "next/server";
import {
  handleRejectInvitation,
} from "@/lib/backend/controllers/client/community/communityController";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  const { invitationId } = await params;
  return await handleRejectInvitation(request, invitationId);
}









