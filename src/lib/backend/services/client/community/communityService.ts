// Service for client community operations

import {
  findPublicCommunities,
  findUserCommunities,
  findCommunityById,
} from "../../../repositories/community/communityRepository";
import {
  addMember,
  findMember,
  removeMember as removeMemberRepo,
} from "../../../repositories/community/communityMemberRepository";
import {
  findInvitationById,
  updateInvitationStatus,
} from "../../../repositories/community/communityInvitationRepository";
import { AuthorizationError, NotFoundError, ConflictError } from "../../../utils/errors";

/**
 * List communities (public + user's communities)
 */
export async function listCommunities(userId: string) {
  const publicCommunities = await findPublicCommunities();
  const userCommunities = await findUserCommunities(userId);

  // Combine and deduplicate
  const communityMap = new Map();
  
  publicCommunities.forEach((community) => {
    communityMap.set(community.id, {
      ...community,
      isMember: false,
    });
  });

  userCommunities.forEach((community) => {
    communityMap.set(community.id, {
      ...community,
      isMember: true,
    });
  });

  return Array.from(communityMap.values());
}

/**
 * Get community details
 */
export async function getCommunityDetails(
  communityId: string,
  userId: string
) {
  const community = await findCommunityById(communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Check if user is a member
  const membership = await findMember(communityId, userId);
  const isMember = membership?.status === "ACTIVE";

  return {
    ...community,
    isMember,
  };
}

/**
 * Join a community
 */
export async function joinCommunity(communityId: string, userId: string) {
  const community = await findCommunityById(communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Check if already a member
  const existingMember = await findMember(communityId, userId);
  if (existingMember) {
    if (existingMember.status === "BANNED") {
      throw new AuthorizationError("You are banned from this community");
    }
    if (existingMember.status === "ACTIVE") {
      throw new ConflictError("You are already a member of this community");
    }
  }

  // Check if public
  if (community.visibility !== "PUBLIC") {
    throw new AuthorizationError("This community is private. You need an invitation to join");
  }

  return await addMember({
    communityId,
    userId,
    role: "MEMBER",
    status: "ACTIVE",
  });
}

/**
 * Leave a community
 */
export async function leaveCommunity(communityId: string, userId: string) {
  const membership = await findMember(communityId, userId);
  if (!membership) {
    throw new NotFoundError("Membership");
  }

  // Cannot leave if owner
  if (membership.role === "OWNER") {
    throw new AuthorizationError("Community owners cannot leave their communities");
  }

  return await removeMemberRepo(communityId, userId);
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(invitationId: string, userId: string) {
  const invitation = await findInvitationById(invitationId);
  if (!invitation) {
    throw new NotFoundError("Invitation");
  }

  // Verify user is invited
  if (invitation.invitedUserId !== userId) {
    throw new AuthorizationError("This invitation is not for you");
  }

  // Check if already accepted/rejected
  if (invitation.status !== "PENDING") {
    throw new ConflictError("This invitation has already been responded to");
  }

  // Update invitation status
  await updateInvitationStatus(invitationId, "ACCEPTED");

  // Check if already a member
  const existingMember = await findMember(invitation.communityId, userId);
  if (existingMember) {
    return existingMember;
  }

  // Add member
  return await addMember({
    communityId: invitation.communityId,
    userId,
    role: "MEMBER",
    status: "ACTIVE",
  });
}

/**
 * Reject an invitation
 */
export async function rejectInvitation(invitationId: string, userId: string) {
  const invitation = await findInvitationById(invitationId);
  if (!invitation) {
    throw new NotFoundError("Invitation");
  }

  // Verify user is invited
  if (invitation.invitedUserId !== userId) {
    throw new AuthorizationError("This invitation is not for you");
  }

  // Check if already accepted/rejected
  if (invitation.status !== "PENDING") {
    throw new ConflictError("This invitation has already been responded to");
  }

  return await updateInvitationStatus(invitationId, "REJECTED");
}
















