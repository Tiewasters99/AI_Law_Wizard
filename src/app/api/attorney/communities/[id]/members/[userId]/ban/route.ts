// API route for banning a member

import { NextRequest } from "next/server";
import { handleBanMember } from "@/lib/backend/controllers/attorney/community/communityModerationController";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  return await handleBanMember(request, id, userId);
}
