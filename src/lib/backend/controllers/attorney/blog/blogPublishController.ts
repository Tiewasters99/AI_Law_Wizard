// Controller for blog publish/unpublish

import { NextRequest } from "next/server";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import { publishBlog } from "../../../services/attorney/blog/blogService";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateRequired } from "../../../utils/validation";

/**
 * Handle PUT request - Update blog publish status
 */
export async function handlePublishBlog(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    const body = await request.json();
    const { id, published } = body;

    validateRequired(id, "Blog ID");
    if (typeof published !== "boolean") {
      return errorResponse(
        new Error("Published status must be a boolean"),
        "Validation failed"
      );
    }

    const blog = await publishBlog(id, published);
    return successResponse({ blog });
  } catch (error) {
    return errorResponse(error, "Failed to update blog publish status");
  }
}
