// Client Attorneys API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleListAttorneys } from "@/lib/backend/controllers/client/attorneys/attorneysController";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleListAttorneys(request, session?.user?.id || "");
}
