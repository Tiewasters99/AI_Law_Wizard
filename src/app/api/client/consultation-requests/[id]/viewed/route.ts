// Client Consultation Request Mark as Viewed API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleMarkRequestAsViewed } from "@/lib/backend/controllers/client/consultationRequests/consultationRequestsController";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  return handleMarkRequestAsViewed(request, id, session?.user?.id || "");
}
