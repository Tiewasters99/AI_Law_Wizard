// Service for client blog posts functionality

import { findAllBlogs } from "../../../repositories/attorney/blogRepository";

export interface BlogFilterOptions {
  category?: string;
  search?: string;
}

/**
 * Get published blog posts for clients
 */
export async function getPublishedBlogPosts(
  filters: BlogFilterOptions = {}
) {
  const allBlogs = await findAllBlogs();

  // Filter only published blogs
  let publishedBlogs = allBlogs.filter(blog => blog.published);

  // Apply category filter
  if (filters.category && filters.category !== "all") {
    publishedBlogs = publishedBlogs.filter(
      blog => blog.category === filters.category
    );
  }

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    publishedBlogs = publishedBlogs.filter(
      blog =>
        blog.title.toLowerCase().includes(searchLower) ||
        blog.content.toLowerCase().includes(searchLower) ||
        blog.author.toLowerCase().includes(searchLower)
    );
  }

  // Format response
  const formatted = publishedBlogs.map(blog => ({
    id: blog.id,
    title: blog.title,
    content: blog.content,
    author: blog.author,
    category: blog.category,
    tags: blog.tags,
    readTime: blog.readTime,
    views: blog.views,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  }));

  return {
    blogs: formatted,
    total: formatted.length,
  };
}

