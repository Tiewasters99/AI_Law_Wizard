// Attorney Token Packages API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import {
  handleGetTokenPackages,
  handleCreateTokenPackage,
} from "@/lib/backend/controllers/attorney/tokenPackages/tokenPackagesController";

export async function GET() {
  return handleGetTokenPackages();
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleCreateTokenPackage(req, session?.user?.id || "");
}
