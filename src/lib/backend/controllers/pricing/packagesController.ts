// Controller for pricing packages API endpoint

import { NextRequest } from "next/server";
import { getActivePackages } from "../../services/pricing/packagesService";
import { successResponse, errorResponse } from "../../utils/response";
import type { Role } from "@prisma/client";

/**
 * Handle GET request for pricing packages
 */
export async function handleGetPackages(
  request: NextRequest
): Promise<Response> {
  try {
    // Read role from query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") as Role | null;

    const packages = await getActivePackages(role || undefined);
    
    // Return in format expected by frontend: { packages: [...] }
    return successResponse({ packages });
  } catch (error) {
    return errorResponse(error, "Failed to fetch pricing packages");
  }
}

