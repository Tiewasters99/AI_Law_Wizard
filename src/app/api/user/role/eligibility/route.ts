import { NextRequest } from "next/server";
import { handleCheckRoleSwitch } from "@/lib/backend/controllers/user/roleController";

export async function GET(request: NextRequest) {
  return await handleCheckRoleSwitch(request);
}



