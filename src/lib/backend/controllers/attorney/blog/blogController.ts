// Controller for attorney blog API endpoints

import { NextRequest } from "next/server";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import {
  getAllBlogs,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "../../../services/attorney/blog/blogService";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateNonEmptyString } from "../../../utils/validation";

/**
 * Handle GET request - List all blogs
 */
export async function handleGetBlogs(): Promise<Response> {
  try {
    const blogs = await getAllBlogs();
    return successResponse({ blogs });
  } catch (error) {
    return errorResponse(error, "Failed to fetch blogs");
  }
}

/**
 * Handle POST request - Create new blog
 */
export async function handleCreateBlog(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    const body = await request.json();
    const { title, content } = body;

    const validatedTitle = validateNonEmptyString(title, "Title");
    const validatedContent = validateNonEmptyString(content, "Content");

    const blog = await createBlogPost({
      title: validatedTitle,
      content: validatedContent,
      author: "Attorney", // Will be updated with actual user name
    });

    return successResponse({ blog });
  } catch (error) {
    return errorResponse(error, "Failed to create blog");
  }
}

/**
 * Handle PUT request - Update existing blog
 */
export async function handleUpdateBlog(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    const body = await request.json();
    const { id, title, content } = body;

    if (!id) {
      return errorResponse(
        new Error("Blog ID is required"),
        "Validation failed"
      );
    }

    const validatedTitle = validateNonEmptyString(title, "Title");
    const validatedContent = validateNonEmptyString(content, "Content");

    const blog = await updateBlogPost(id, {
      title: validatedTitle,
      content: validatedContent,
    });

    return successResponse({ blog });
  } catch (error) {
    return errorResponse(error, "Failed to update blog");
  }
}

/**
 * Handle DELETE request - Delete blog
 */
export async function handleDeleteBlog(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse(
        new Error("Blog ID is required"),
        "Validation failed"
      );
    }

    await deleteBlogPost(id);
    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error, "Failed to delete blog");
  }
}
