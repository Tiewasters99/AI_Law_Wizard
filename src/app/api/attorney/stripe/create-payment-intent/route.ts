// Attorney Stripe Payment Intent API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleCreatePaymentIntent } from "@/lib/backend/controllers/attorney/stripe/stripePaymentController";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleCreatePaymentIntent(req, session?.user?.id || "");
}
