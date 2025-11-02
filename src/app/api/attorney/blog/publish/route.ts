// Attorney Blog Publish API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handlePublishBlog } from "@/lib/backend/controllers/attorney/blog/blogPublishController";

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handlePublishBlog(request, session?.user?.id || "");
}
