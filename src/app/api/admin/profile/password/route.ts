import { NextRequest } from "next/server";
import { handleUpdatePassword } from "@/lib/backend/controllers/admin/profile/profileController";

export async function POST(request: NextRequest) {
  return handleUpdatePassword(request);
}

