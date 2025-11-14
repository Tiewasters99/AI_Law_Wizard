// Client Files API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import {
  handleListFiles,
  handleDeleteFile,
} from "@/lib/backend/controllers/client/files/filesController";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleListFiles(request, session?.user?.id);
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return new Response(JSON.stringify({ error: "File ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return handleDeleteFile(request, session?.user?.id, fileId);
}
