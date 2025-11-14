// Client Blog Posts API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleGetBlogPosts } from "@/lib/backend/controllers/client/blog/blogPostsController";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleGetBlogPosts(request, session?.user?.id || "");
}
