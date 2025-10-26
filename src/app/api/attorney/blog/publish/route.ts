import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is an attorney
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAttorney = currentUser.role === "ATTORNEY";

    if (!isAttorney) {
      return NextResponse.json(
        { error: "Access denied. Attorney access required." },
        { status: 403 }
      );
    }

    const { id, published } = await request.json();

    if (!id || typeof published !== "boolean") {
      return NextResponse.json(
        { error: "ID and published status are required" },
        { status: 400 }
      );
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: { published },
    });

    return NextResponse.json({ blog });
  } catch (error) {
    console.error("Error updating blog publish status:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}
