// Attorney Projects API Route

import { NextRequest } from "next/server";
import { handleListAttorneyProjects } from "@/lib/backend/controllers/common/projects/projectController";

export async function GET(request: NextRequest) {
  return await handleListAttorneyProjects(request);
}

