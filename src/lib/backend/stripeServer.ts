import Stripe from "stripe";

// Server-side Stripe instance - only used in API routes
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});
