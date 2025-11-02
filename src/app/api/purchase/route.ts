// Purchase API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handlePurchase } from "@/lib/backend/controllers/purchase/purchaseController";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email || null;
  return handlePurchase(request, userEmail);
}
