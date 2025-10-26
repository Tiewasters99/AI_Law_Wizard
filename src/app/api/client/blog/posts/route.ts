import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {
      published: true, // Only show published blogs
    };

    // Add category filter if provided
    if (category && category !== "all") {
      where.category = category;
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch published blogs
    const blogs = await prisma.blog.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        content: true,
        author: true,
        category: true,
        tags: true,
        readTime: true,
        views: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      blogs,
      total: blogs.length,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch blog posts",
        blogs: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
