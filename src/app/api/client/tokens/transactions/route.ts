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

    const isClient = session.user.role === "CUSTOMER";

    if (!isClient) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch transactions
    const transactions = await prisma.tokenTransaction.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        metadata: true,
        createdAt: true,
      },
    });

    // Get total count
    const total = await prisma.tokenTransaction.count({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      transactions,
      total,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching token transactions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch transactions",
        transactions: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
