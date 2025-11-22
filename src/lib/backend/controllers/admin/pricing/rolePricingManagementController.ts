// Controller for admin role pricing management

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import {
  createRolePricing,
  updateRolePricing,
  deleteRolePricing as deleteRolePricingService,
} from "../../../services/admin/pricing/rolePricingManagementService";
import { successResponse, errorResponse } from "../../../utils/response";
import { ValidationError, AppError } from "../../../utils/errors";

/**
 * Handle POST create role pricing request
 */
export async function handleCreateRolePricing(request: NextRequest) {
  try {
    const admin = await requireAdminAuth(request);

    const body = await request.json();
    const { packageId, role, priceInCents, isActive } = body;

    if (!packageId) {
      throw new ValidationError("packageId is required");
    }
    if (!role || (role !== "ATTORNEY" && role !== "CUSTOMER")) {
      throw new ValidationError("role must be ATTORNEY or CUSTOMER");
    }
    if (typeof priceInCents !== "number" || priceInCents <= 0) {
      throw new ValidationError("priceInCents must be a positive number");
    }

    const created = await createRolePricing(
      packageId,
      role,
      priceInCents,
      admin.id,
      isActive ?? true
    );

    return successResponse(created, 201);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to create role pricing");
  }
}

/**
 * Handle PUT update role pricing request
 */
export async function handleUpdateRolePricing(
  request: NextRequest,
  rolePricingId: string
) {
  try {
    const admin = await requireAdminAuth(request);

    const body = await request.json();
    const { priceInCents } = body;

    if (typeof priceInCents !== "number" || priceInCents <= 0) {
      throw new ValidationError("priceInCents must be a positive number");
    }

    const updated = await updateRolePricing(
      rolePricingId,
      priceInCents,
      admin.id
    );

    return successResponse(updated);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to update role pricing");
  }
}

/**
 * Handle DELETE role pricing request
 */
export async function handleDeleteRolePricing(
  request: NextRequest,
  rolePricingId: string
) {
  try {
    const admin = await requireAdminAuth(request);

    await deleteRolePricingService(rolePricingId, admin.id);

    return successResponse({ success: true });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to delete role pricing");
  }
}
