// Attorney Project Milestones API Route

import { NextRequest } from "next/server";
import {
  handleCreateMilestone,
  handleGetMilestones,
} from "@/lib/backend/controllers/common/projects/projectController";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleCreateMilestone(request, id);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleGetMilestones(request, id);
}

