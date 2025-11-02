// Attorney Wallet API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import {
  handleGetWallet,
  handleConsumeTokens,
} from "@/lib/backend/controllers/attorney/wallet/walletController";

export async function GET() {
  const session = await getServerSession(authOptions);
  return handleGetWallet(session?.user?.id || "");
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleConsumeTokens(req, session?.user?.id || "");
}
