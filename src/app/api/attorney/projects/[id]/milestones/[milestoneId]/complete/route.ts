// Attorney Complete Milestone API Route

import { NextRequest } from "next/server";
import { handleCompleteMilestone } from "@/lib/backend/controllers/common/projects/projectController";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const { id, milestoneId } = await params;
  return await handleCompleteMilestone(request, id, milestoneId);
}

