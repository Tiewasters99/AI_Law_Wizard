// Repository for CommunityMember database operations

import { prisma } from "../../prisma";
import { MemberRole, MemberStatus } from "@prisma/client";

export interface CreateMemberData {
  communityId: string;
  userId: string;
  role: MemberRole;
  status?: MemberStatus;
}

/**
 * Add a member to a community
 */
export async function addMember(data: CreateMemberData) {
  return await prisma.communityMember.create({
    data: {
      ...data,
      status: data.status || "ACTIVE",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

/**
 * Remove a member from a community
 */
export async function removeMember(communityId: string, userId: string) {
  return await prisma.communityMember.delete({
    where: {
      communityId_userId: {
        communityId,
        userId,
      },
    },
  });
}

/**
 * Find a specific member
 */
export async function findMember(communityId: string, userId: string) {
  return await prisma.communityMember.findUnique({
    where: {
      communityId_userId: {
        communityId,
        userId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

/**
 * Find all members of a community
 */
export async function findCommunityMembers(communityId: string) {
  return await prisma.communityMember.findMany({
    where: { communityId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: [
      { role: "asc" }, // OWNER first
      { joinedAt: "asc" },
    ],
  });
}

/**
 * Ban a member
 */
export async function banMember(communityId: string, userId: string) {
  return await prisma.communityMember.update({
    where: {
      communityId_userId: {
        communityId,
        userId,
      },
    },
    data: {
      status: "BANNED",
    },
  });
}

/**
 * Unban a member
 */
export async function unbanMember(communityId: string, userId: string) {
  return await prisma.communityMember.update({
    where: {
      communityId_userId: {
        communityId,
        userId,
      },
    },
    data: {
      status: "ACTIVE",
    },
  });
}

/**
 * Get member count for a community
 */
export async function getMemberCount(communityId: string) {
  return await prisma.communityMember.count({
    where: {
      communityId,
      status: "ACTIVE",
    },
  });
}
















