// Controller for Stripe webhook API endpoint

import { NextRequest } from "next/server";
import { stripe } from "../../../stripeServer";
import { processStripeWebhook } from "../../../services/attorney/stripe/stripeWebhookService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle POST request - Process Stripe webhook
 */
export async function handleStripeWebhook(
  request: NextRequest
): Promise<Response> {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return errorResponse(
        new Error("Missing stripe signature"),
        "Missing stripe signature"
      );
    }

    // Verify webhook signature
    let event: any;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return errorResponse(error, "Webhook signature verification failed");
    }

    // Process webhook event
    const result = await processStripeWebhook(event);
    return successResponse(result);
  } catch (error) {
    console.error("Error processing webhook:", error);
    return errorResponse(
      error,
      error instanceof Error ? error.message : "Webhook processing failed"
    );
  }
}
