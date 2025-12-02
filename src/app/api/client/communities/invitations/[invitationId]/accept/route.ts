// API route for accepting an invitation

import { NextRequest } from "next/server";
import {
  handleAcceptInvitation,
} from "@/lib/backend/controllers/client/community/communityController";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  const { invitationId } = await params;
  return await handleAcceptInvitation(request, invitationId);
}










