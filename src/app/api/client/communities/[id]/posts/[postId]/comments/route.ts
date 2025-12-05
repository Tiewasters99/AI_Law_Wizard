// API route for client community comments

import { NextRequest } from "next/server";
import {
  handleListComments,
  handleCreateComment,
} from "@/lib/backend/controllers/client/community/communityCommentController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const { id, postId } = await params;
  return await handleListComments(request, id, postId);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const { id, postId } = await params;
  return await handleCreateComment(request, id, postId);
}
















