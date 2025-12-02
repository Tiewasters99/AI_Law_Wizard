// Controller for client community operations

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { verifyClientAccess } from "../../../utils/clientAuth";
import {
  listCommunities,
  getCommunityDetails,
  joinCommunity,
  leaveCommunity,
  acceptInvitation,
  rejectInvitation,
} from "../../../services/client/community/communityService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle list communities request
 */
export async function handleListCommunities(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const client = await verifyClientAccess(session?.user?.id);

    const communities = await listCommunities(client.id);
    return successResponse({ communities });
  } catch (error) {
    return errorResponse(error, "Failed to fetch communities");
  }
}

/**
 * Handle get community details request
 */
export async function handleGetCommunityDetails(
  request: NextRequest,
  id: string
) {
  try {
    const session = await getServerSession(authOptions);
    const client = await verifyClientAccess(session?.user?.id);

    const community = await getCommunityDetails(id, client.id);
    return successResponse({ community });
  } catch (error) {
    return errorResponse(error, "Failed to fetch community details");
  }
}

/**
 * Handle join community request
 */
export async function handleJoinCommunity(
  request: NextRequest,
  id: string
) {
  try {
    const session = await getServerSession(authOptions);
    const client = await verifyClientAccess(session?.user?.id);

    const membership = await joinCommunity(id, client.id);
    return successResponse({ membership }, 201);
  } catch (error) {
    return errorResponse(error, "Failed to join community");
  }
}

/**
 * Handle leave community request
 */
export async function handleLeaveCommunity(
  request: NextRequest,
  id: string
) {
  try {
    const session = await getServerSession(authOptions);
    const client = await verifyClientAccess(session?.user?.id);

    await leaveCommunity(id, client.id);
    return successResponse({ message: "Left community successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to leave community");
  }
}

/**
 * Handle accept invitation request
 */
export async function handleAcceptInvitation(
  request: NextRequest,
  invitationId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const client = await verifyClientAccess(session?.user?.id);

    const membership = await acceptInvitation(invitationId, client.id);
    return successResponse({ membership });
  } catch (error) {
    return errorResponse(error, "Failed to accept invitation");
  }
}

/**
 * Handle reject invitation request
 */
export async function handleRejectInvitation(
  request: NextRequest,
  invitationId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const client = await verifyClientAccess(session?.user?.id);

    await rejectInvitation(invitationId, client.id);
    return successResponse({ message: "Invitation rejected successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to reject invitation");
  }
}












