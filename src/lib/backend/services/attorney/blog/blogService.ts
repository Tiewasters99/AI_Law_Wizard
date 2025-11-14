// Service for attorney blog functionality

import {
  findAllBlogs,
  createBlog,
  updateBlog,
  updateBlogPublishStatus,
  deleteBlog,
  type CreateBlogData,
  type UpdateBlogData,
} from "../../../repositories/attorney/blogRepository";

/**
 * Get all blogs
 */
export async function getAllBlogs() {
  return await findAllBlogs();
}

/**
 * Create a new blog
 */
export async function createBlogPost(data: CreateBlogData) {
  return await createBlog(data);
}

/**
 * Update an existing blog
 */
export async function updateBlogPost(id: string, data: UpdateBlogData) {
  return await updateBlog(id, data);
}

/**
 * Update blog publish status
 */
export async function publishBlog(id: string, published: boolean) {
  return await updateBlogPublishStatus(id, published);
}

/**
 * Delete a blog
 */
export async function deleteBlogPost(id: string) {
  await deleteBlog(id);
  return { success: true };
}

