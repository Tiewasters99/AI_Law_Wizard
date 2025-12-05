// Controller for attorney community operations

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import {
  createCommunity,
  updateCommunity,
  deleteCommunity,
  listMyCommunities,
  getCommunityDetails,
} from "../../../services/attorney/community/communityService";
import { successResponse, errorResponse } from "../../../utils/response";
import { ValidationError } from "../../../utils/errors";

/**
 * Handle create community request
 */
export async function handleCreateCommunity(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const attorney = await verifyAttorneyAccess(session?.user?.id);

    const body = await request.json();
    if (!body.name) {
      return errorResponse(new ValidationError("Community name is required"));
    }
    if (!body.visibility || !["PUBLIC", "PRIVATE"].includes(body.visibility)) {
      return errorResponse(
        new ValidationError("Visibility must be PUBLIC or PRIVATE")
      );
    }

    const community = await createCommunity(
      {
        name: body.name,
        description: body.description,
        visibility: body.visibility,
        allowClientPosts: body.allowClientPosts || false,
        createdBy: attorney.id,
      },
      attorney.id
    );

    return successResponse({ community }, 201);
  } catch (error) {
    return errorResponse(error, "Failed to create community");
  }
}

/**
 * Handle update community request
 */
export async function handleUpdateCommunity(
  request: NextRequest,
  id: string
) {
  try {
    const session = await getServerSession(authOptions);
    const attorney = await verifyAttorneyAccess(session?.user?.id);

    const body = await request.json();
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.visibility !== undefined) {
      if (!["PUBLIC", "PRIVATE"].includes(body.visibility)) {
        return errorResponse(
          new ValidationError("Visibility must be PUBLIC or PRIVATE")
        );
      }
      updateData.visibility = body.visibility;
    }
    if (body.allowClientPosts !== undefined)
      updateData.allowClientPosts = body.allowClientPosts;

    const community = await updateCommunity(id, updateData, attorney.id);
    return successResponse({ community });
  } catch (error) {
    return errorResponse(error, "Failed to update community");
  }
}

/**
 * Handle delete community request
 */
export async function handleDeleteCommunity(
  request: NextRequest,
  id: string
) {
  try {
    const session = await getServerSession(authOptions);
    const attorney = await verifyAttorneyAccess(session?.user?.id);

    await deleteCommunity(id, attorney.id);
    return successResponse({ message: "Community deleted successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to delete community");
  }
}

/**
 * Handle list my communities request
 */
export async function handleListMyCommunities(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const attorney = await verifyAttorneyAccess(session?.user?.id);

    const communities = await listMyCommunities(attorney.id);
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
    const attorney = await verifyAttorneyAccess(session?.user?.id);

    const community = await getCommunityDetails(id, attorney.id);
    return successResponse({ community });
  } catch (error) {
    return errorResponse(error, "Failed to fetch community details");
  }
}
















