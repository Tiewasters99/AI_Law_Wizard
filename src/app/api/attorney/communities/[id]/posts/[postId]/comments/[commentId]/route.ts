// API route for deleting a comment (moderation)

import { NextRequest } from "next/server";
import {
  handleDeleteComment,
} from "@/lib/backend/controllers/attorney/community/communityModerationController";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string; commentId: string }> }
) {
  const { id, postId, commentId } = await params;
  return await handleDeleteComment(request, id, postId, commentId);
}




