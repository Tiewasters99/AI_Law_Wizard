// Service for attorney community post operations

import {
  createPost as createPostRepo,
  updatePost as updatePostRepo,
  findPostsByCommunity,
  findPostById as findPostByIdRepo,
  CreatePostData,
  UpdatePostData,
  PostListOptions,
} from "../../../repositories/community/communityPostRepository";
import { findMember } from "../../../repositories/community/communityMemberRepository";
import { findCommunityById } from "../../../repositories/community/communityRepository";
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

  const community = await findCommunityById(post.communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Verify author or owner
  if (post.authorId !== authorId && community.createdBy !== authorId) {
    throw new AuthorizationError("You can only update your own posts");
  }

  return await updatePostRepo(postId, data);
}

/**
 * List posts in a community
 */
export async function listPosts(
  communityId: string,
  attorneyId: string,
  options?: PostListOptions
) {
  const community = await findCommunityById(communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Verify membership
  const membership = await findMember(communityId, attorneyId);
  if (!membership || membership.status !== "ACTIVE") {
    throw new AuthorizationError("You must be a member to view posts");
  }

  return await findPostsByCommunity(communityId, options);
}
















