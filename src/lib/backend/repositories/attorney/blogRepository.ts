// Repository for blog database operations

import { prisma } from "../../prisma";

export interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string | null;
  tags: string[];
  readTime: number | null;
  views: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBlogData {
  title: string;
  content: string;
  author: string;
}

export interface UpdateBlogData {
  title?: string;
  content?: string;
}

/**
 * Find all blogs ordered by creation date
 */
export async function findAllBlogs(): Promise<Blog[]> {
  return await prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Find blog by ID
 */
export async function findBlogById(id: string): Promise<Blog | null> {
  return await prisma.blog.findUnique({
    where: { id },
  });
}

/**
 * Create a new blog
 */
export async function createBlog(data: CreateBlogData): Promise<Blog> {
  return await prisma.blog.create({
    data: {
      title: data.title.trim(),
      content: data.content.trim(),
      author: data.author,
      published: false,
    },
  });
}

/**
 * Update an existing blog
 */
export async function updateBlog(
  id: string,
  data: UpdateBlogData
): Promise<Blog> {
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (data.title) {
    updateData.title = data.title.trim();
  }

  if (data.content) {
    updateData.content = data.content.trim();
  }

  return await prisma.blog.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Update blog publish status
 */
export async function updateBlogPublishStatus(
  id: string,
  published: boolean
): Promise<Blog> {
  return await prisma.blog.update({
    where: { id },
    data: { published },
  });
}

/**
 * Delete a blog
 */
export async function deleteBlog(id: string): Promise<void> {
  await prisma.blog.delete({
    where: { id },
  });
}
