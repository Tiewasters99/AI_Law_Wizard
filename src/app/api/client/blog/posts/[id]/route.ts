// Client Blog Post Detail API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleGetBlogPost } from "@/lib/backend/controllers/client/blog/blogPostsController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  return handleGetBlogPost(id, session?.user?.id || "");
}
