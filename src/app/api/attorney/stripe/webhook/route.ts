// Attorney Stripe Webhook API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { handleStripeWebhook } from "@/lib/backend/controllers/attorney/stripe/stripeWebhookController";

export async function POST(req: NextRequest) {
  return handleStripeWebhook(req);
}
