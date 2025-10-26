import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";

// GET - Fetch query history for attorney
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    // Fetch queries for this user
    const queries = await prisma.documentQuery.findMany({
      where: {
        userId: session.user.id,
        ...(search && {
          OR: [
            { userQuery: { contains: search, mode: "insensitive" } },
            { aiResponse: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        userQuery: true,
        aiResponse: true,
        searchQuery: true,
        success: true,
        error: true,
        confidence: true,
        processingTime: true,
        totalSteps: true,
        completedSteps: true,
        toolsUsed: true,
        filesProcessed: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      queries,
    });
  } catch (error) {
    console.error("Error fetching query history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch query history",
      },
      { status: 500 }
    );
  }
}
