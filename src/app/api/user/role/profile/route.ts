import { NextRequest } from "next/server";
import { handleCreateProfile } from "@/lib/backend/controllers/user/roleController";

export async function POST(request: NextRequest) {
  return await handleCreateProfile(request);
}



