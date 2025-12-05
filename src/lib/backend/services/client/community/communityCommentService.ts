// Service for client community comment operations

import {
  createComment as createCommentRepo,
  updateComment as updateCommentRepo,
  softDeleteComment as softDeleteCommentRepo,
  findCommentsByPost,
  findCommentById as findCommentByIdRepo,
  CreateCommentData,
  UpdateCommentData,
} from "../../../repositories/community/communityCommentRepository";
import { findPostById } from "../../../repositories/community/communityPostRepository";
import { findMember } from "../../../repositories/community/communityMemberRepository";
import { AuthorizationError, NotFoundError } from "../../../utils/errors";

/**
 * Create a comment
 */
export async function createComment(
  postId: string,
  data: Omit<CreateCommentData, 'postId' | 'authorId'>,
  authorId: string
) {
  const post = await findPostById(postId);
  if (!post) {
    throw new NotFoundError("Post");
  }

  // Verify membership
  const membership = await findMember(post.communityId, authorId);
  if (!membership || membership.status !== "ACTIVE") {
    throw new AuthorizationError("You must be a member to comment");
  }

  return await createCommentRepo({
    ...data,
    postId,
    authorId,
  });
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  data: UpdateCommentData,
  authorId: string
) {
  const comment = await findCommentByIdRepo(commentId);
  if (!comment) {
    throw new NotFoundError("Comment");
  }

  // Verify author
  if (comment.authorId !== authorId) {
    throw new AuthorizationError("You can only update your own comments");
  }

  return await updateCommentRepo(commentId, data);
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string, authorId: string) {
  const comment = await findCommentByIdRepo(commentId);
  if (!comment) {
    throw new NotFoundError("Comment");
  }

  // Verify author
  if (comment.authorId !== authorId) {
    throw new AuthorizationError("You can only delete your own comments");
  }

  return await softDeleteCommentRepo(commentId);
}

/**
 * List comments for a post
 */
export async function listComments(postId: string, userId: string) {
  const post = await findPostById(postId);
  if (!post) {
    throw new NotFoundError("Post");
  }

  // Verify membership
  const membership = await findMember(post.communityId, userId);
  if (!membership || membership.status !== "ACTIVE") {
    throw new AuthorizationError("You must be a member to view comments");
  }

  return await findCommentsByPost(postId);
}
















