// Service for attorney community operations

import {
  createCommunity as createCommunityRepo,
  findCommunityById,
  findCommunitiesByOwner,
  updateCommunity as updateCommunityRepo,
  deleteCommunity as deleteCommunityRepo,
  CreateCommunityData,
  UpdateCommunityData,
} from "../../../repositories/community/communityRepository";
import { addMember } from "../../../repositories/community/communityMemberRepository";
import { AuthorizationError, NotFoundError } from "../../../utils/errors";
import { prisma } from "../../../prisma";

/**
 * Create a new community
 */
export async function createCommunity(
  data: CreateCommunityData,
  attorneyId: string
) {
  // Verify attorney role
  const user = await prisma.user.findUnique({
    where: { id: attorneyId },
    select: { id: true, role: true },
  });
  if (!user) {
    throw new NotFoundError("User");
  }
  if (user.role !== "ATTORNEY") {
    throw new AuthorizationError("Only attorneys can create communities");
  }

  // Create community
  const community = await createCommunityRepo({
    ...data,
    createdBy: attorneyId,
  });

  // Create owner membership
  await addMember({
    communityId: community.id,
    userId: attorneyId,
    role: "OWNER",
    status: "ACTIVE",
  });

  return community;
}

/**
 * Update community
 */
export async function updateCommunity(
  communityId: string,
  data: UpdateCommunityData,
  attorneyId: string
) {
  const community = await findCommunityById(communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Verify ownership
  if (community.createdBy !== attorneyId) {
    throw new AuthorizationError("Only the community owner can update it");
  }

  return await updateCommunityRepo(communityId, data);
}

/**
 * Delete community
 */
export async function deleteCommunity(
  communityId: string,
  attorneyId: string
) {
  const community = await findCommunityById(communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Verify ownership
  if (community.createdBy !== attorneyId) {
    throw new AuthorizationError("Only the community owner can delete it");
  }

  return await deleteCommunityRepo(communityId);
}

/**
 * List attorney's communities
 */
export async function listMyCommunities(attorneyId: string) {
  return await findCommunitiesByOwner(attorneyId);
}

/**
 * Get community details
 */
export async function getCommunityDetails(
  communityId: string,
  attorneyId: string
) {
  const community = await findCommunityById(communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Verify ownership
  if (community.createdBy !== attorneyId) {
    throw new AuthorizationError("Access denied");
  }

  return community;
}

