// API route for pinning a post

import { NextRequest } from "next/server";
import {
  handlePinPost,
} from "@/lib/backend/controllers/attorney/community/communityModerationController";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const { id, postId } = await params;
  return await handlePinPost(request, id, postId);
}




