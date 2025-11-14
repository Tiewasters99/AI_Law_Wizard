// Attorney Embedding API Route
// Handles file uploads for embedding processing

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleFileUpload } from "@/lib/backend/controllers/attorney/embedding/embeddingController";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleFileUpload(request, session?.user?.id);
}
