// Controller for attorney community moderation operations

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import {
  banMember,
  unbanMember,
  removeMember,
  inviteToCommunity,
  pinPost,
  unpinPost,
  deletePost,
  deleteComment,
} from "../../../services/attorney/community/communityModerationService";
import { successResponse, errorResponse } from "../../../utils/response";
import { ValidationError } from "../../../utils/errors";

/**
 * Handle ban member request
 */
export async function handleBanMember(
  request: NextRequest,
  communityId: string,
  userId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const attorney = await verifyAttorneyAccess(session?.user?.id);

    await banMember(communityId, userId, attorney.id);
    return successResponse({ message: "Member banned successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to ban member");
  }
}

/**
 * Handle unban member request
 */
export async function handleUnbanMember(
  request: NextRequest,
  communityId: string,
  userId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const attorney = await verifyAttorneyAccess(session?.user?.id);

    await unbanMember(communityId, userId, attorney.id);
    return successResponse({ message: "Member unbanned successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to unban member");
  }
}

/**
 * Handle remove member request
 */
export async function handleRemoveMember(
  request: NextRequest,
  communityId: string,
  userId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const attorney = await verifyAttorneyAccess(session?.user?.id);

    await removeMember(communityId, userId, attorney.id);
    return successResponse({ message: "Member removed successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to remove member");
  }
}

/**
 * Handle invite member request
 */
export async function handleInviteMember(
  request: NextRequest,
  communityId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const attorney = await verifyAttorneyAccess(session?.user?.id);

    const body = await request.json();
    if (!body.invitedUserId) {
      return errorResponse(
        new ValidationError("invitedUserId is required")
      );
    }

    const invitation = await inviteToCommunity(
      communityId,
      body.invitedUserId,
      attorney.id
    );
    return successResponse({ invitation }, 201);
  } catch (error) {
    return errorResponse(error, "Failed to invite member");
  }
}

/**
 * Handle pin post request
 */
export async function handlePinPost(
  request: NextRequest,
  communityId: string,
  postId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const attorney = await verifyAttorneyAccess(session?.user?.id);

    await pinPost(postId, attorney.id);
    return successResponse({ message: "Post pinned successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to pin post");
  }
}

/**
 * Handle unpin post request
 */
export async function handleUnpinPost(
  request: NextRequest,
  communityId: string,
  postId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const attorney = await verifyAttorneyAccess(session?.user?.id);

    await unpinPost(postId, attorney.id);
    return successResponse({ message: "Post unpinned successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to unpin post");
  }
}

/**
 * Handle delete post request (moderation)
 */
export async function handleDeletePost(
  request: NextRequest,
  communityId: string,
  postId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const attorney = await verifyAttorneyAccess(session?.user?.id);

    await deletePost(postId, attorney.id);
    return successResponse({ message: "Post deleted successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to delete post");
  }
}

/**
 * Handle delete comment request (moderation)
 */
export async function handleDeleteComment(
  request: NextRequest,
  communityId: string,
  postId: string,
  commentId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const attorney = await verifyAttorneyAccess(session?.user?.id);

    await deleteComment(commentId, attorney.id);
    return successResponse({ message: "Comment deleted successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to delete comment");
  }
}
















