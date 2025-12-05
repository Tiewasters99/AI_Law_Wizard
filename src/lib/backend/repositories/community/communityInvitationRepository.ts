// Repository for CommunityInvitation database operations

import { prisma } from "../../prisma";
import { InvitationStatus } from "@prisma/client";

export interface CreateInvitationData {
  communityId: string;
  invitedUserId: string;
  invitedBy: string;
}

/**
 * Create a new invitation
 */
export async function createInvitation(data: CreateInvitationData) {
  return await prisma.communityInvitation.create({
    data,
    include: {
      community: {
        select: {
          id: true,
          name: true,
        },
      },
      invitedUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      inviter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Find invitation by ID
 */
export async function findInvitationById(id: string) {
  return await prisma.communityInvitation.findUnique({
    where: { id },
    include: {
      community: {
        select: {
          id: true,
          name: true,
          visibility: true,
        },
      },
      invitedUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      inviter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Update invitation status
 */
export async function updateInvitationStatus(
  id: string,
  status: InvitationStatus
) {
  return await prisma.communityInvitation.update({
    where: { id },
    data: {
      status,
      respondedAt: new Date(),
    },
    include: {
      community: {
        select: {
          id: true,
          name: true,
        },
      },
      invitedUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Find pending invitations for a user
 */
export async function findPendingInvitations(userId: string) {
  return await prisma.communityInvitation.findMany({
    where: {
      invitedUserId: userId,
      status: "PENDING",
    },
    include: {
      community: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      inviter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Find invitations by community
 */
export async function findInvitationsByCommunity(communityId: string) {
  return await prisma.communityInvitation.findMany({
    where: { communityId },
    include: {
      invitedUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      inviter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
















