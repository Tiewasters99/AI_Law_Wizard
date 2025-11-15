// Client OneDrive Auth URL API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleGetClientOneDriveAuthUrl } from "@/lib/backend/controllers/client/onedrive/onedriveAuthController";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleGetClientOneDriveAuthUrl(request, session?.user?.id);
}
