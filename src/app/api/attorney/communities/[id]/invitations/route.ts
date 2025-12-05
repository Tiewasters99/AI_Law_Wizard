// API route for community invitations

import { NextRequest } from "next/server";
import {
  handleInviteMember,
} from "@/lib/backend/controllers/attorney/community/communityModerationController";
import { findInvitationsByCommunity } from "@/lib/backend/repositories/community/communityInvitationRepository";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { verifyAttorneyAccess } from "@/lib/backend/utils/attorneyAuth";
import { successResponse, errorResponse } from "@/lib/backend/utils/response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleInviteMember(request, id);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    await verifyAttorneyAccess(session?.user?.id);
    
    const invitations = await findInvitationsByCommunity(id);
    return successResponse({ invitations });
  } catch (error) {
    return errorResponse(error, "Failed to fetch invitations");
  }
}




