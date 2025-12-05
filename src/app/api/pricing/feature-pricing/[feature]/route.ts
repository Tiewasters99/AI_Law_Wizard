// Feature Pricing by Feature API Route (Public)
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { handleGetFeaturePricingByFeature } from "@/lib/backend/controllers/pricing/featurePricingController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ feature: string }> }
) {
  const { feature } = await params;
  // Pass feature as query param since Next.js dynamic routes don't support query params easily
  const url = new URL(request.url);
  url.searchParams.set("feature", feature);
  const modifiedRequest = new NextRequest(url, request);

  return handleGetFeaturePricingByFeature(modifiedRequest);
}
