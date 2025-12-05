// Controller for client community comment operations

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { verifyClientAccess } from "../../../utils/clientAuth";
import {
  createComment,
  updateComment,
  deleteComment,
  listComments,
} from "../../../services/client/community/communityCommentService";
import { successResponse, errorResponse } from "../../../utils/response";
import { ValidationError } from "../../../utils/errors";

/**
 * Handle create comment request
 */
export async function handleCreateComment(
  request: NextRequest,
  communityId: string,
  postId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const client = await verifyClientAccess(session?.user?.id);

    const body = await request.json();
    if (!body.content) {
      return errorResponse(new ValidationError("Comment content is required"));
    }

    const comment = await createComment(
      postId,
      {
        content: body.content,
        parentId: body.parentId,
      },
      client.id
    );

    return successResponse({ comment }, 201);
  } catch (error) {
    return errorResponse(error, "Failed to create comment");
  }
}

/**
 * Handle update comment request
 */
export async function handleUpdateComment(
  request: NextRequest,
  communityId: string,
  postId: string,
  commentId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const client = await verifyClientAccess(session?.user?.id);

    const body = await request.json();
    if (!body.content) {
      return errorResponse(new ValidationError("Comment content is required"));
    }

    const comment = await updateComment(commentId, { content: body.content }, client.id);
    return successResponse({ comment });
  } catch (error) {
    return errorResponse(error, "Failed to update comment");
  }
}

/**
 * Handle delete comment request
 */
export async function handleDeleteComment(
  request: NextRequest,
  communityId: string,
  postId: string,
  commentId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const client = await verifyClientAccess(session?.user?.id);

    await deleteComment(commentId, client.id);
    return successResponse({ message: "Comment deleted successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to delete comment");
  }
}

/**
 * Handle list comments request
 */
export async function handleListComments(
  request: NextRequest,
  communityId: string,
  postId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const client = await verifyClientAccess(session?.user?.id);

    const comments = await listComments(postId, client.id);
    return successResponse({ comments });
  } catch (error) {
    return errorResponse(error, "Failed to fetch comments");
  }
}
















