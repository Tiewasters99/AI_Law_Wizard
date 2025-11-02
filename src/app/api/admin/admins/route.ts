import { NextRequest } from "next/server";
import { handleListAdmins } from "@/lib/backend/controllers/admin/admins/adminsController";

export async function GET(request: NextRequest) {
  return handleListAdmins(request);
}
