// API route for removing a member

import { NextRequest } from "next/server";
import { handleRemoveMember } from "@/lib/backend/controllers/attorney/community/communityModerationController";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  return await handleRemoveMember(request, id, userId);
}
