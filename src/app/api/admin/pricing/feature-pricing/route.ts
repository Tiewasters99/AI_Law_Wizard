// Admin Feature Pricing API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import {
  handleListFeaturePricing,
  handleCreateFeaturePricing,
  handleGetFeaturePricingByFeature,
} from "@/lib/backend/controllers/admin/pricing/featurePricingController";

// Disable caching - admin pricing data must be fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  // Check if feature query param is present
  const { searchParams } = new URL(request.url);
  const feature = searchParams.get("feature");

  if (feature) {
    return handleGetFeaturePricingByFeature(request);
  }

  return handleListFeaturePricing(request);
}

export async function POST(request: NextRequest) {
  return handleCreateFeaturePricing(request);
}
