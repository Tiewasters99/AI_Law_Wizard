// Attorney Profile API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import {
  handleGetProfile,
  handleUpdateProfile,
} from "@/lib/backend/controllers/attorney/profile/profileController";

export async function GET() {
  const session = await getServerSession(authOptions);
  return handleGetProfile(session?.user?.id || "");
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleUpdateProfile(request, session?.user?.id || "");
}
