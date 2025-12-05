// Controller for feature pricing API endpoint (public)

import { NextRequest } from "next/server";
import {
  getAllFeaturePricing,
  getFeaturePricing,
} from "../../services/pricing/featurePricingService";
import { successResponse, errorResponse } from "../../utils/response";
import type { Role } from "@prisma/client";

/**
 * Handle GET request for feature pricing
 * Query params: role (optional) - Filter by role
 */
export async function handleGetFeaturePricing(
  request: NextRequest
): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") as Role | null;

    const pricing = await getAllFeaturePricing(role || undefined);

    return successResponse({ pricing });
  } catch (error) {
    return errorResponse(error, "Failed to fetch feature pricing");
  }
}

/**
 * Handle GET request for specific feature pricing
 * Query params: feature (required), role (optional)
 */
export async function handleGetFeaturePricingByFeature(
  request: NextRequest
): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const feature = searchParams.get("feature");
    const role = searchParams.get("role") as Role | null;

    if (!feature) {
      return errorResponse(
        new Error("Feature parameter is required"),
        "Feature parameter is required"
      );
    }

    const pricing = await getFeaturePricing(feature, role || undefined);

    if (!pricing) {
      return successResponse({ pricing: null });
    }

    return successResponse({ pricing });
  } catch (error) {
    return errorResponse(error, "Failed to fetch feature pricing");
  }
}
