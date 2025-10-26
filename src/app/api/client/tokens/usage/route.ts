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

    // Get total purchased
    const totalPurchased = await prisma.tokenTransaction.aggregate({
      where: {
        userId: session.user.id,
        type: "PURCHASE",
      },
      _sum: {
        amount: true,
      },
    });

    // Get total consumed
    const totalConsumed = await prisma.tokenTransaction.aggregate({
      where: {
        userId: session.user.id,
        type: "CONSUMPTION",
      },
      _sum: {
        amount: true,
      },
    });

    // Get usage by feature (from metadata)
    const consumptionTransactions = await prisma.tokenTransaction.findMany({
      where: {
        userId: session.user.id,
        type: "CONSUMPTION",
      },
      select: {
        amount: true,
        metadata: true,
      },
    });

    // Aggregate by feature
    const featureUsage: Record<string, number> = {};
    consumptionTransactions.forEach(transaction => {
      const metadata = transaction.metadata as any;
      const feature = metadata?.feature || "Other";
      featureUsage[feature] =
        (featureUsage[feature] || 0) + Math.abs(transaction.amount);
    });

    const totalUsed = Math.abs(totalConsumed._sum.amount || 0);

    // Convert to array with percentages
    const breakdown = Object.entries(featureUsage).map(([feature, tokens]) => ({
      feature,
      tokens,
      percentage: totalUsed > 0 ? Math.round((tokens / totalUsed) * 100) : 0,
    }));

    return NextResponse.json({
      totalPurchased: totalPurchased._sum.amount || 0,
      totalUsed,
      breakdown,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching token usage:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch usage stats",
        totalPurchased: 0,
        totalUsed: 0,
        breakdown: [],
      },
      { status: 500 }
    );
  }
}
