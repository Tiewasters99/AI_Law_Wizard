// API route for client community post operations

import { NextRequest } from "next/server";
import {
  handleUpdatePost,
  handleDeletePost,
} from "@/lib/backend/controllers/client/community/communityPostController";
import { findPostById } from "@/lib/backend/repositories/community/communityPostRepository";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { verifyClientAccess } from "@/lib/backend/utils/clientAuth";
import { findMember } from "@/lib/backend/repositories/community/communityMemberRepository";
import { successResponse, errorResponse } from "@/lib/backend/utils/response";
import { AuthorizationError } from "@/lib/backend/utils/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { id, postId } = await params;
    const session = await getServerSession(authOptions);
    const client = await verifyClientAccess(session?.user?.id);
    
    const post = await findPostById(postId);
    if (!post) {
      return errorResponse(new Error("Post not found"), "Post not found");
    }
    
    // Verify membership
    const membership = await findMember(id, client.id);
    if (!membership || membership.status !== "ACTIVE") {
      return errorResponse(new AuthorizationError("You must be a member to view posts"), "Access denied");
    }
    
    return successResponse({ post });
  } catch (error) {
    return errorResponse(error, "Failed to fetch post");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const { id, postId } = await params;
  return await handleUpdatePost(request, id, postId);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const { id, postId } = await params;
  return await handleDeletePost(request, id, postId);
}

