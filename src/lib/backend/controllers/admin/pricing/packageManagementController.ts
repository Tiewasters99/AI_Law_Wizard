// Controller for admin package management

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import {
  updatePackage,
  deletePackage as deletePackageService,
} from "../../../services/admin/pricing/packageManagementService";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle PUT update package request
 */
export async function handleUpdatePackage(
  request: NextRequest,
  packageId: string
) {
  try {
    await requireAdminAuth(request);

    const body = await request.json();
    const { name, tokens, priceInCents, description, isActive } = body;

    const updatedPackage = await updatePackage(packageId, {
      name,
      tokens,
      priceInCents,
      description,
      isActive,
    });

    return successResponse(updatedPackage);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to update package");
  }
}

/**
 * Handle DELETE package request
 */
export async function handleDeletePackage(
  request: NextRequest,
  packageId: string
) {
  try {
    await requireAdminAuth(request);

    await deletePackageService(packageId);

    return successResponse({ success: true });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to delete package");
  }
}

