// API route for client community posts

import { NextRequest } from "next/server";
import {
  handleListPosts,
  handleCreatePost,
} from "@/lib/backend/controllers/client/community/communityPostController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleListPosts(request, id);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleCreatePost(request, id);
}
















