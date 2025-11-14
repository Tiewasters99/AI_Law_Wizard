// Attorney Files API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleListFiles } from "@/lib/backend/controllers/attorney/files/filesController";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleListFiles(request, session?.user?.id);
}
