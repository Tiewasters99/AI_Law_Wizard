// Attorney OneDrive API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import {
  handleListOneDriveFiles,
  handleDownloadOneDriveFile,
} from "@/lib/backend/controllers/attorney/onedrive/onedriveController";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleListOneDriveFiles(request, session?.user?.id || "");
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleDownloadOneDriveFile(request, session?.user?.id || "");
}
