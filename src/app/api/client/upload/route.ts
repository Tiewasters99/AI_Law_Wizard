// Client Upload API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import {
  handleUploadFiles,
  handleDeleteFile,
} from "@/lib/backend/controllers/client/upload/uploadController";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleUploadFiles(request, session?.user?.id || "");
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleDeleteFile(request, session?.user?.id || "");
}
