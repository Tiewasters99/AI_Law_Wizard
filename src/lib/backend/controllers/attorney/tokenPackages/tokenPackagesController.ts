// Controller for attorney token packages API endpoints

import { NextRequest } from "next/server";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import {
  getTokenPackages,
  createTokenPackage,
} from "../../../services/attorney/tokenPackages/tokenPackagesService";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateRequired, validateRange } from "../../../utils/validation";

/**
 * Handle GET request - Get all token packages
 */
export async function handleGetTokenPackages(): Promise<Response> {
  try {
    const packages = await getTokenPackages();
    return successResponse({ packages });
  } catch (error) {
    return errorResponse(error, "Failed to fetch token packages");
  }
}

/**
 * Handle POST request - Create token package
 * Note: Pricing must be added separately via RolePricing API
 */
export async function handleCreateTokenPackage(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    const body = await request.json();
    const { name, tokens, description } = body;

    validateRequired(name, "Name");
    validateRequired(tokens, "Tokens");
    validateRange(tokens, 1, 1000000, "Tokens");

    const tokenPackage = await createTokenPackage({
      name,
      tokens,
      description,
    });

    return successResponse({ package: tokenPackage });
  } catch (error) {
    return errorResponse(error, "Failed to create token package");
  }
}
