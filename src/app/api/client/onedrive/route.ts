// Client OneDrive API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import {
  handleListClientOneDriveFiles,
  handleDownloadClientOneDriveFile,
} from "@/lib/backend/controllers/client/onedrive/onedriveController";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleListClientOneDriveFiles(request, session?.user?.id);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleDownloadClientOneDriveFile(request, session?.user?.id);
}

