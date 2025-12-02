// API route for unpinning a post

import { NextRequest } from "next/server";
import {
  handleUnpinPost,
} from "@/lib/backend/controllers/attorney/community/communityModerationController";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const { id, postId } = await params;
  return await handleUnpinPost(request, id, postId);
}




