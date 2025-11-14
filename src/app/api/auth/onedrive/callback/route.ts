import { NextRequest } from "next/server";
import { handleOneDriveCallback } from "@/lib/backend/controllers/auth/onedriveOAuthController";

export async function GET(request: NextRequest) {
  return handleOneDriveCallback(request);
}
