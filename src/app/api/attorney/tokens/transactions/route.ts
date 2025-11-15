// Attorney Token Transactions API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleGetTokenTransactions } from "@/lib/backend/controllers/attorney/tokens/tokenTransactionsController";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleGetTokenTransactions(request, session?.user?.id || "");
}
