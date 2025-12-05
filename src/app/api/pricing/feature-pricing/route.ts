// Feature Pricing API Route (Public)
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { handleGetFeaturePricing } from "@/lib/backend/controllers/pricing/featurePricingController";

export async function GET(request: NextRequest) {
  return handleGetFeaturePricing(request);
}
