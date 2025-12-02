// Repository for CommunityPost database operations

import { prisma } from "../../prisma";

export interface CreatePostData {
  communityId: string;
  authorId: string;
  title: string;
  content: string;
  attachments?: any;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  attachments?: any;
}

export interface PostListOptions {
  skip?: number;
  take?: number;
}

/**
 * Create a new post
 */
export async function createPost(data: CreatePostData) {
  return await prisma.communityPost.create({
    data,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      community: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          comments: {
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
 * Find post by ID
 */
export async function findPostById(id: string) {
  return await prisma.communityPost.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      community: {
        select: {
          id: true,
          name: true,
          allowClientPosts: true,
        },
      },
      _count: {
        select: {
          comments: {
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
 * Find posts by community
 */
export async function findPostsByCommunity(
  communityId: string,
  options?: PostListOptions
) {
  const pinnedPosts = await prisma.communityPost.findMany({
    where: {
      communityId,
      isPinned: true,
      isDeleted: false,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      _count: {
        select: {
          comments: {
            where: {
              isDeleted: false,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const regularPosts = await prisma.communityPost.findMany({
    where: {
      communityId,
      isPinned: false,
      isDeleted: false,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      _count: {
        select: {
          comments: {
            where: {
              isDeleted: false,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: options?.skip,
    take: options?.take,
  });

  return [...pinnedPosts, ...regularPosts];
}

/**
 * Update post
 */
export async function updatePost(id: string, data: UpdatePostData) {
  return await prisma.communityPost.update({
    where: { id },
    data,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      _count: {
        select: {
          comments: {
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
 * Soft delete post
 */
export async function softDeletePost(id: string, deletedBy: string) {
  return await prisma.communityPost.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
    },
  });
}

/**
 * Pin a post
 */
export async function pinPost(id: string) {
  return await prisma.communityPost.update({
    where: { id },
    data: {
      isPinned: true,
    },
  });
}

/**
 * Unpin a post
 */
export async function unpinPost(id: string) {
  return await prisma.communityPost.update({
    where: { id },
    data: {
      isPinned: false,
    },
  });
}

/**
 * Find pinned posts for a community
 */
export async function findPinnedPosts(communityId: string) {
  return await prisma.communityPost.findMany({
    where: {
      communityId,
      isPinned: true,
      isDeleted: false,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      _count: {
        select: {
          comments: {
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












