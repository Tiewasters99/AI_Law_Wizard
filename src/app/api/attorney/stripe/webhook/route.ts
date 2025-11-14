// Stripe Webhook API Route
// This webhook is role-agnostic and handles payments for both ATTORNEY and CUSTOMER roles
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { handleStripeWebhook } from "@/lib/backend/controllers/attorney/stripe/stripeWebhookController";

export async function POST(req: NextRequest) {
  return handleStripeWebhook(req);
}
