// Client Project by ID API Route

import { NextRequest } from "next/server";
import {
  handleGetProject,
  handleUpdateProjectStatus,
} from "@/lib/backend/controllers/common/projects/projectController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleGetProject(request, id);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleUpdateProjectStatus(request, id);
}

