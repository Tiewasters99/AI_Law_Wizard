// Attorney Update Milestone API Route

import { NextRequest } from "next/server";
import { handleUpdateMilestone } from "@/lib/backend/controllers/common/projects/projectController";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const { id, milestoneId } = await params;
  return await handleUpdateMilestone(request, id, milestoneId);
}

