// Controller for client attorneys API endpoints

import { NextRequest } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import { listAttorneys } from "../../../services/client/attorneys/attorneysService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - List attorneys
 */
export async function handleListAttorneys(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const practiceArea = searchParams.get("practiceArea");
    const location = searchParams.get("location");

    const result = await listAttorneys({
      search: search || undefined,
      practiceArea: practiceArea || undefined,
      location: location || undefined,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch attorneys");
  }
}

