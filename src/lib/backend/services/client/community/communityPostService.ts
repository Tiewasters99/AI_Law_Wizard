// Service for client community post operations

import {
  createPost as createPostRepo,
  updatePost as updatePostRepo,
  softDeletePost as softDeletePostRepo,
  findPostsByCommunity,
  findPostById as findPostByIdRepo,
  CreatePostData,
  UpdatePostData,
  PostListOptions,
} from "../../../repositories/community/communityPostRepository";
import {
  findMember,
} from "../../../repositories/community/communityMemberRepository";
import { findCommunityById } from "../../../repositories/community/communityRepository";
import { prisma } from "../../../prisma";
import { AuthorizationError, NotFoundError } from "../../../utils/errors";

/**
 * Create a post
 */
export async function createPost(
  communityId: string,
  data: Omit<CreatePostData, "communityId" | "authorId">,
  authorId: string
) {
  const community = await findCommunityById(communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Verify membership
  const membership = await findMember(communityId, authorId);
  if (!membership || membership.status !== "ACTIVE") {
    throw new AuthorizationError("You must be a member to post");
  }

  // Check if client can post
  const author = await prisma.user.findUnique({
    where: { id: authorId },
    select: { id: true, role: true },
  });
  if (!author) {
    throw new NotFoundError("User");
  }

  if (author.role === "CUSTOMER" && !community.allowClientPosts) {
    throw new AuthorizationError("Clients are not allowed to post in this community");
  }

  return await createPostRepo({
    ...data,
    communityId,
    authorId,
  });
}

/**
 * Update a post
 */
export async function updatePost(
  postId: string,
  data: UpdatePostData,
  authorId: string
) {
  const post = await findPostByIdRepo(postId);
  if (!post) {
    throw new NotFoundError("Post");
  }

  // Verify author
  if (post.authorId !== authorId) {
    throw new AuthorizationError("You can only update your own posts");
  }

  return await updatePostRepo(postId, data);
}

/**
 * Delete a post
 */
export async function deletePost(postId: string, authorId: string) {
  const post = await findPostByIdRepo(postId);
  if (!post) {
    throw new NotFoundError("Post");
  }

  // Verify author
  if (post.authorId !== authorId) {
    throw new AuthorizationError("You can only delete your own posts");
  }

  return await softDeletePostRepo(postId, authorId);
}

/**
 * List posts in a community
 */
export async function listPosts(
  communityId: string,
  userId: string,
  options?: PostListOptions
) {
  const community = await findCommunityById(communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Verify membership
  const membership = await findMember(communityId, userId);
  if (!membership || membership.status !== "ACTIVE") {
    throw new AuthorizationError("You must be a member to view posts");
  }

  return await findPostsByCommunity(communityId, options);
}

