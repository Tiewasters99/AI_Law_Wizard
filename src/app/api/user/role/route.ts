import { NextRequest } from "next/server";
import { handleSwitchRole } from "@/lib/backend/controllers/user/roleController";

export async function PATCH(request: NextRequest) {
  return await handleSwitchRole(request);
}



