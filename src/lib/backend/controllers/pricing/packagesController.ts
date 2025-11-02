// Controller for pricing packages API endpoint

import { getActivePackages } from "../../services/pricing/packagesService";
import { successResponse, errorResponse } from "../../utils/response";

/**
 * Handle GET request for pricing packages
 */
export async function handleGetPackages(): Promise<Response> {
  try {
    const packages = await getActivePackages();
    return successResponse(packages);
  } catch (error) {
    return errorResponse(error, "Failed to fetch pricing packages");
  }
}

