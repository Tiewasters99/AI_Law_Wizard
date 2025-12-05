// Service for attorney community moderation operations

import {
  banMember as banMemberRepo,
  unbanMember as unbanMemberRepo,
  removeMember as removeMemberRepo,
  findMember,
} from "../../../repositories/community/communityMemberRepository";
import {
  createInvitation as createInvitationRepo,
} from "../../../repositories/community/communityInvitationRepository";
import {
  pinPost as pinPostRepo,
  unpinPost as unpinPostRepo,
  softDeletePost as softDeletePostRepo,
  findPostById as findPostByIdRepo,
} from "../../../repositories/community/communityPostRepository";
import {
  softDeleteComment as softDeleteCommentRepo,
  findCommentById as findCommentByIdRepo,
} from "../../../repositories/community/communityCommentRepository";
import { findCommunityById } from "../../../repositories/community/communityRepository";
import { AuthorizationError, NotFoundError } from "../../../utils/errors";

/**
 * Ban a member
 */
export async function banMember(
  communityId: string,
  userId: string,
  moderatorId: string
) {
  const community = await findCommunityById(communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Verify moderator is owner
  if (community.createdBy !== moderatorId) {
    throw new AuthorizationError("Only the community owner can ban members");
  }

  return await banMemberRepo(communityId, userId);
}

/**
 * Unban a member
 */
export async function unbanMember(
  communityId: string,
  userId: string,
  moderatorId: string
) {
  const community = await findCommunityById(communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Verify moderator is owner
  if (community.createdBy !== moderatorId) {
    throw new AuthorizationError("Only the community owner can unban members");
  }

  return await unbanMemberRepo(communityId, userId);
}

/**
 * Remove a member
 */
export async function removeMember(
  communityId: string,
  userId: string,
  moderatorId: string
) {
  const community = await findCommunityById(communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Verify moderator is owner
  if (community.createdBy !== moderatorId) {
    throw new AuthorizationError("Only the community owner can remove members");
  }

  return await removeMemberRepo(communityId, userId);
}

/**
 * Invite a user to a community
 */
export async function inviteToCommunity(
  communityId: string,
  invitedUserId: string,
  inviterId: string
) {
  const community = await findCommunityById(communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Verify inviter is owner
  if (community.createdBy !== inviterId) {
    throw new AuthorizationError("Only the community owner can invite members");
  }

  return await createInvitationRepo({
    communityId,
    invitedUserId,
    invitedBy: inviterId,
  });
}

/**
 * Pin a post
 */
export async function pinPost(postId: string, userId: string) {
  const post = await findPostByIdRepo(postId);
  if (!post) {
    throw new NotFoundError("Post");
  }

  const community = await findCommunityById(post.communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Verify user is owner
  if (community.createdBy !== userId) {
    throw new AuthorizationError("Only the community owner can pin posts");
  }

  return await pinPostRepo(postId);
}

/**
 * Unpin a post
 */
export async function unpinPost(postId: string, userId: string) {
  const post = await findPostByIdRepo(postId);
  if (!post) {
    throw new NotFoundError("Post");
  }

  const community = await findCommunityById(post.communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Verify user is owner
  if (community.createdBy !== userId) {
    throw new AuthorizationError("Only the community owner can unpin posts");
  }

  return await unpinPostRepo(postId);
}

/**
 * Delete a post (moderation)
 */
export async function deletePost(postId: string, userId: string) {
  const post = await findPostByIdRepo(postId);
  if (!post) {
    throw new NotFoundError("Post");
  }

  const community = await findCommunityById(post.communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Verify user is owner
  if (community.createdBy !== userId) {
    throw new AuthorizationError("Only the community owner can delete posts");
  }

  return await softDeletePostRepo(postId, userId);
}

/**
 * Delete a comment (moderation)
 */
export async function deleteComment(commentId: string, userId: string) {
  const comment = await findCommentByIdRepo(commentId);
  if (!comment) {
    throw new NotFoundError("Comment");
  }

  // Get post to find community
  const post = await findPostByIdRepo(comment.postId);
  if (!post) {
    throw new NotFoundError("Post");
  }

  const community = await findCommunityById(post.communityId);
  if (!community) {
    throw new NotFoundError("Community");
  }

  // Verify user is owner
  if (community.createdBy !== userId) {
    throw new AuthorizationError("Only the community owner can delete comments");
  }

  return await softDeleteCommentRepo(commentId);
}
















