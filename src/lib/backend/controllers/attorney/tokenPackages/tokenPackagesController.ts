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
 */
export async function handleCreateTokenPackage(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    const body = await request.json();
    const { name, tokens, priceInCents, description } = body;

    validateRequired(name, "Name");
    validateRequired(tokens, "Tokens");
    validateRequired(priceInCents, "Price");
    validateRange(tokens, 1, 1000000, "Tokens");
    validateRange(priceInCents, 1, 100000000, "Price in cents");

    const tokenPackage = await createTokenPackage({
      name,
      tokens,
      priceInCents,
      description,
    });

    return successResponse({ package: tokenPackage });
  } catch (error) {
    return errorResponse(error, "Failed to create token package");
  }
}

