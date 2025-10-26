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

    // Get user's wallet for token balance
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
      select: {
        balance: true,
      },
    });

    const currentBalance = wallet?.balance || 0;

    // Calculate total tokens purchased
    const totalPurchased = await prisma.tokenTransaction.aggregate({
      where: {
        userId: session.user.id,
        type: "PURCHASE",
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate total tokens consumed
    const totalConsumed = await prisma.tokenTransaction.aggregate({
      where: {
        userId: session.user.id,
        type: "CONSUMPTION",
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      balance: currentBalance,
      totalPurchased: totalPurchased._sum?.amount || 0,
      totalConsumed: Math.abs(totalConsumed._sum?.amount || 0),
      success: true,
    });
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch token balance",
        balance: 0,
        totalPurchased: 0,
        totalConsumed: 0,
      },
      { status: 500 }
    );
  }
}
