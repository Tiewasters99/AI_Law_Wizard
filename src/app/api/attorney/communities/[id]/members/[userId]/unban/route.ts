// API route for unbanning a member

import { NextRequest } from "next/server";
import {
  handleUnbanMember,
} from "@/lib/backend/controllers/attorney/community/communityModerationController";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  return await handleUnbanMember(request, id, userId);
}




