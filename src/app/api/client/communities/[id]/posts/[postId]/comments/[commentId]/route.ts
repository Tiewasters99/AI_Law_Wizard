// API route for client community comment operations

import { NextRequest } from "next/server";
import {
  handleUpdateComment,
  handleDeleteComment,
} from "@/lib/backend/controllers/client/community/communityCommentController";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string; commentId: string }> }
) {
  const { id, postId, commentId } = await params;
  return await handleUpdateComment(request, id, postId, commentId);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string; commentId: string }> }
) {
  const { id, postId, commentId } = await params;
  return await handleDeleteComment(request, id, postId, commentId);
}












