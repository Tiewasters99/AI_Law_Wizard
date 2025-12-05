import { NextRequest } from "next/server";
import { handleCreateUser } from "@/lib/backend/controllers/admin/users/usersController";

export async function POST(request: NextRequest) {
  return handleCreateUser(request);
}
