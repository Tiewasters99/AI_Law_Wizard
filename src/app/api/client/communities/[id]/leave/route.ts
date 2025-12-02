// API route for leaving a community

import { NextRequest } from "next/server";
import {
  handleLeaveCommunity,
} from "@/lib/backend/controllers/client/community/communityController";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleLeaveCommunity(request, id);
}









