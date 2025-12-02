// API route for joining a community

import { NextRequest } from "next/server";
import {
  handleJoinCommunity,
} from "@/lib/backend/controllers/client/community/communityController";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleJoinCommunity(request, id);
}









