// Controller for admin package management

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import {
  updatePackage,
  deletePackage as deletePackageService,
} from "../../../services/admin/pricing/packageManagementService";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError, ValidationError } from "../../../utils/errors";

/**
 * Handle PUT update package request
 */
export async function handleUpdatePackage(
  request: NextRequest,
  packageId: string
) {
  try {
    // Authenticate first
    await requireAdminAuth(request);

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return errorResponse(
        new ValidationError("Invalid JSON in request body"),
        "Failed to parse request body"
      );
    }

    const { name, tokens, description, isActive } = body;

    const updatedPackage = await updatePackage(packageId, {
      name,
      tokens,
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
