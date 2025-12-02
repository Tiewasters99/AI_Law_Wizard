// API route for deleting a post (moderation)

import { NextRequest } from "next/server";
import {
  handleDeletePost,
} from "@/lib/backend/controllers/attorney/community/communityModerationController";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const { id, postId } = await params;
  return await handleDeletePost(request, id, postId);
}




