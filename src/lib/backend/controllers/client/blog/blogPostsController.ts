// Controller for client blog posts API endpoints

import { NextRequest } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import {
  getPublishedBlogPosts,
  getPublishedBlogPostById,
} from "../../../services/client/blog/blogPostsService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle GET request - Get published blog posts
 */
export async function handleGetBlogPosts(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const result = await getPublishedBlogPosts({
      category: category || undefined,
      search: search || undefined,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch blog posts");
  }
}

/**
 * Handle GET request - Get a single published blog post by ID
 */
export async function handleGetBlogPost(
  id: string,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const blog = await getPublishedBlogPostById(id);

    return successResponse({ blog });
  } catch (error) {
    return errorResponse(error, "Failed to fetch blog post");
  }
}
