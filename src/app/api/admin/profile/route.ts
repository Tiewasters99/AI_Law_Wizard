import { NextRequest } from "next/server";
import { handleGetProfile } from "@/lib/backend/controllers/admin/profile/profileController";

export async function GET(request: NextRequest) {
  return handleGetProfile(request);
}
