// Repository for CommunityComment database operations

import { prisma } from "../../prisma";

export interface CreateCommentData {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string;
}

export interface UpdateCommentData {
  content?: string;
}

/**
 * Create a new comment
 */
export async function createComment(data: CreateCommentData) {
  return await prisma.communityComment.create({
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
      parent: {
        select: {
          id: true,
          authorId: true,
        },
      },
      _count: {
        select: {
          replies: {
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
 * Find comment by ID
 */
export async function findCommentById(id: string) {
  return await prisma.communityComment.findUnique({
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
      post: {
        select: {
          id: true,
          communityId: true,
        },
      },
      parent: {
        select: {
          id: true,
          authorId: true,
        },
      },
    },
  });
}

/**
 * Find comments by post
 */
export async function findCommentsByPost(postId: string) {
  // Get top-level comments (no parent)
  const topLevelComments = await prisma.communityComment.findMany({
    where: {
      postId,
      parentId: null,
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
      replies: {
        where: {
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
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return topLevelComments;
}

/**
 * Update comment
 */
export async function updateComment(id: string, data: UpdateCommentData) {
  return await prisma.communityComment.update({
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
    },
  });
}

/**
 * Soft delete comment
 */
export async function softDeleteComment(id: string) {
  return await prisma.communityComment.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
}












