// Client File Download API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleDownloadFile } from "@/lib/backend/controllers/client/files/filesController";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleDownloadFile(request, session?.user?.id);
}
