// Role Pricing API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { handleGetRolePricing } from "@/lib/backend/controllers/pricing/rolePricingController";

export async function GET(request: NextRequest) {
  return handleGetRolePricing(request);
}
