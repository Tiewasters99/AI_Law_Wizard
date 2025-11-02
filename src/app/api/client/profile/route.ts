// Client Profile API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import {
  handleGetProfile,
  handleUpdateProfile,
} from "@/lib/backend/controllers/client/profile/profileController";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleGetProfile(session?.user?.id || "");
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleUpdateProfile(req, session?.user?.id || "");
}
