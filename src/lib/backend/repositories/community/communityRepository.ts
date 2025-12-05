// Repository for Community database operations

import { prisma } from "../../prisma";
import { CommunityVisibility } from "@prisma/client";

export interface CreateCommunityData {
  name: string;
  description?: string;
  visibility: CommunityVisibility;
  allowClientPosts: boolean;
  createdBy: string;
}

export interface UpdateCommunityData {
  name?: string;
  description?: string;
  visibility?: CommunityVisibility;
  allowClientPosts?: boolean;
}

/**
 * Create a new community
 */
export async function createCommunity(data: CreateCommunityData) {
  return await prisma.community.create({
    data,
    include: {
      owner: {
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
 * Find community by ID
 */
export async function findCommunityById(id: string) {
  return await prisma.community.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          members: true,
          posts: {
            where: {
              isDeleted: false,
            },
          },
        },
      },
    },
  });
}

/**
 * Find communities by owner
 */
export async function findCommunitiesByOwner(ownerId: string) {
  return await prisma.community.findMany({
    where: { createdBy: ownerId },
    include: {
      _count: {
        select: {
          members: true,
          posts: {
            where: {
              isDeleted: false,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Update community
 */
export async function updateCommunity(id: string, data: UpdateCommunityData) {
  return await prisma.community.update({
    where: { id },
    data,
    include: {
      owner: {
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
 * Delete community
 */
export async function deleteCommunity(id: string) {
  return await prisma.community.delete({
    where: { id },
  });
}

/**
 * Find public communities
 */
export async function findPublicCommunities() {
  return await prisma.community.findMany({
    where: { visibility: "PUBLIC" },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          members: true,
          posts: {
            where: {
              isDeleted: false,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Find communities user is a member of
 */
export async function findUserCommunities(userId: string) {
  return await prisma.community.findMany({
    where: {
      members: {
        some: {
          userId,
          status: "ACTIVE",
        },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          members: true,
          posts: {
            where: {
              isDeleted: false,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
















