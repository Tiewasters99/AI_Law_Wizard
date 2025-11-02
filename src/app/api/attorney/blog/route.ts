// Attorney Blog API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import {
  handleGetBlogs,
  handleCreateBlog,
  handleUpdateBlog,
  handleDeleteBlog,
} from "@/lib/backend/controllers/attorney/blog/blogController";

export async function GET() {
  return handleGetBlogs();
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleCreateBlog(request, session?.user?.id || "");
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleUpdateBlog(request, session?.user?.id || "");
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return handleDeleteBlog(request, session?.user?.id || "");
}
