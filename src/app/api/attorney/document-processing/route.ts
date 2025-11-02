// Attorney Document Processing API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleProcessDocuments } from "@/lib/backend/controllers/attorney/documentProcessing/documentProcessingController";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleProcessDocuments(request, session?.user?.id);
}
