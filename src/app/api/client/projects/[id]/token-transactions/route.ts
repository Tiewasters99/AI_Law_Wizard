// Client Project Token Transactions API Route

import { NextRequest } from "next/server";
import { handleGetProjectTokenTransactions } from "@/lib/backend/controllers/common/projects/projectController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleGetProjectTokenTransactions(request, id);
}

