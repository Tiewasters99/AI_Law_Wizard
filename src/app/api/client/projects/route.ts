// Client Projects API Route

import { NextRequest } from "next/server";
import {
  handleCreateProject,
  handleListClientProjects,
} from "@/lib/backend/controllers/common/projects/projectController";

export async function POST(request: NextRequest) {
  return await handleCreateProject(request);
}

export async function GET(request: NextRequest) {
  return await handleListClientProjects(request);
}

