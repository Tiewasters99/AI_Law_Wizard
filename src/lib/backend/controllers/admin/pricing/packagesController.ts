// Controller for admin token packages

import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import {
  listPackages,
  createPackage,
} from "../../../services/admin/pricing/packagesService";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle GET packages list request
 */
export async function handleListPackages(request: NextRequest) {
  try {
    await requireAdminAuth(request);
    const packages = await listPackages();
    return successResponse(packages);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch packages");
  }
}

/**
 * Handle POST create package request
 */
export async function handleCreatePackage(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const body = await request.json();
    const { name, tokens, description, isActive } = body;

    const newPackage = await createPackage({
      name,
      tokens,
      description,
      isActive,
    });

    return successResponse(newPackage, 201);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to create package");
  }
}

