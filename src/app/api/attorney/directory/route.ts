// Attorney Directory API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleGetDirectory } from "@/lib/backend/controllers/attorney/directory/directoryController";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleGetDirectory(session?.user?.id || "");
}
