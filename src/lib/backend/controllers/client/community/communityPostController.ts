// Controller for client community post operations

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { verifyClientAccess } from "../../../utils/clientAuth";
import {
  createPost,
  updatePost,
  deletePost,
  listPosts,
} from "../../../services/client/community/communityPostService";
import { successResponse, errorResponse } from "../../../utils/response";
import { ValidationError } from "../../../utils/errors";

/**
 * Handle create post request
 */
export async function handleCreatePost(
  request: NextRequest,
  communityId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const client = await verifyClientAccess(session?.user?.id);

    const body = await request.json();
    if (!body.title) {
      return errorResponse(new ValidationError("Post title is required"));
    }
    if (!body.content) {
      return errorResponse(new ValidationError("Post content is required"));
    }

    const post = await createPost(
      communityId,
      {
        title: body.title,
        content: body.content,
        attachments: body.attachments,
      },
      client.id
    );

    return successResponse({ post }, 201);
  } catch (error) {
    return errorResponse(error, "Failed to create post");
  }
}

/**
 * Handle update post request
 */
export async function handleUpdatePost(
  request: NextRequest,
  communityId: string,
  postId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const client = await verifyClientAccess(session?.user?.id);

    const body = await request.json();
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.attachments !== undefined) updateData.attachments = body.attachments;

    const post = await updatePost(postId, updateData, client.id);
    return successResponse({ post });
  } catch (error) {
    return errorResponse(error, "Failed to update post");
  }
}

/**
 * Handle delete post request
 */
export async function handleDeletePost(
  request: NextRequest,
  communityId: string,
  postId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const client = await verifyClientAccess(session?.user?.id);

    await deletePost(postId, client.id);
    return successResponse({ message: "Post deleted successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to delete post");
  }
}

/**
 * Handle list posts request
 */
export async function handleListPosts(
  request: NextRequest,
  communityId: string
) {
  try {
    const session = await getServerSession(authOptions);
    const client = await verifyClientAccess(session?.user?.id);

    const url = new URL(request.url);
    const skip = url.searchParams.get("skip")
      ? parseInt(url.searchParams.get("skip")!)
      : undefined;
    const take = url.searchParams.get("take")
      ? parseInt(url.searchParams.get("take")!)
      : undefined;

    const posts = await listPosts(communityId, client.id, { skip, take });
    return successResponse({ posts });
  } catch (error) {
    return errorResponse(error, "Failed to fetch posts");
  }
}
















