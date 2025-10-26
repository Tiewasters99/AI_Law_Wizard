import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
          balance: 0,
        },
        include: {
          transactions: true,
        },
      });
    }

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { action, amount, description } = await req.json();

    if (action !== "consume") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount required" },
        { status: 400 }
      );
    }

    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient tokens" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async tx => {
      // Deduct tokens
      await tx.wallet.update({
        where: { id: wallet!.id },
        data: { balance: { decrement: amount } },
      });

      // Create transaction record
      await tx.tokenTransaction.create({
        data: {
          walletId: wallet!.id,
          userId,
          type: "CONSUMPTION",
          amount: -amount,
          description: description || "Token consumption",
        },
      });
    });

    // Fetch updated wallet
    const updatedWallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    return NextResponse.json({ wallet: updatedWallet, success: true });
  } catch (error) {
    console.error("Error processing wallet transaction:", error);
    return NextResponse.json(
      { error: "Failed to process transaction" },
      { status: 500 }
    );
  }
}
