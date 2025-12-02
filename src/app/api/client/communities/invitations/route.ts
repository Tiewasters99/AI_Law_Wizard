// API route for client community invitations

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { verifyClientAccess } from "@/lib/backend/utils/clientAuth";
import { findPendingInvitations } from "@/lib/backend/repositories/community/communityInvitationRepository";
import { successResponse, errorResponse } from "@/lib/backend/utils/response";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const client = await verifyClientAccess(session?.user?.id);
    
    const invitations = await findPendingInvitations(client.id);
    return successResponse({ invitations });
  } catch (error) {
    return errorResponse(error, "Failed to fetch invitations");
  }
}












