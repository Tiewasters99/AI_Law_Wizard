// Controller for admin feature pricing management

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import {
  getAllFeaturePricing,
  getFeaturePricingById,
  createFeaturePricing,
  updateFeaturePricing,
  deleteFeaturePricing,
  getFeaturePricingByFeature,
} from "../../../services/pricing/featurePricingService";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";
import type { Role } from "@prisma/client";

/**
 * Handle GET feature pricing list request
 * Query params: role (optional) - Filter by role
 */
export async function handleListFeaturePricing(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") as Role | null;

    const pricing = await getAllFeaturePricing(role || undefined);

    return successResponse({ pricing });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch feature pricing");
  }
}

/**
 * Handle GET feature pricing by ID request
 */
export async function handleGetFeaturePricingById(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth(request);

    const pricing = await getFeaturePricingById(params.id);

    return successResponse({ pricing });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch feature pricing");
  }
}

/**
 * Handle POST create feature pricing request
 */
export async function handleCreateFeaturePricing(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const body = await request.json();
    const { feature, displayName, tokens, role, description, isActive } = body;

    const newPricing = await createFeaturePricing({
      feature,
      displayName,
      tokens,
      role: role || null,
      description,
      isActive,
    });

    return successResponse({ pricing: newPricing }, 201);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to create feature pricing");
  }
}

/**
 * Handle PUT update feature pricing request
 */
export async function handleUpdateFeaturePricing(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth(request);

    const body = await request.json();
    const { feature, displayName, tokens, role, description, isActive } = body;

    const updatedPricing = await updateFeaturePricing(params.id, {
      feature,
      displayName,
      tokens,
      role: role !== undefined ? role || null : undefined,
      description,
      isActive,
    });

    return successResponse({ pricing: updatedPricing });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to update feature pricing");
  }
}

/**
 * Handle DELETE feature pricing request
 */
export async function handleDeleteFeaturePricing(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth(request);

    await deleteFeaturePricing(params.id);

    return successResponse({ message: "Feature pricing deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to delete feature pricing");
  }
}

/**
 * Handle GET feature pricing by feature name request
 * Query params: feature (required)
 */
export async function handleGetFeaturePricingByFeature(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const feature = searchParams.get("feature");

    if (!feature) {
      return errorResponse(
        new Error("Feature parameter is required"),
        "Feature parameter is required"
      );
    }

    const pricing = await getFeaturePricingByFeature(feature);

    return successResponse({ pricing });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch feature pricing");
  }
}
