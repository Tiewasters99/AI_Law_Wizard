import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { packageId, role } = await request.json();

    if (!packageId || !role) {
      return NextResponse.json(
        { error: "Package ID and role are required" },
        { status: 400 }
      );
    }

    if (!["ATTORNEY", "CUSTOMER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Get the package with role-specific pricing
    const packageData = await prisma.tokenPackage.findUnique({
      where: { id: packageId },
      include: {
        RolePricing: {
          where: { role: role as "ATTORNEY" | "CUSTOMER" },
        },
      },
    });

    if (!packageData) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    if (!packageData.isActive) {
      return NextResponse.json(
        { error: "Package is not available" },
        { status: 400 }
      );
    }

    // Get role-specific price
    const rolePricing = packageData.RolePricing[0];
    const priceInCents = rolePricing
      ? rolePricing.priceInCents
      : packageData.priceInCents;

    // Get user's wallet
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wallet: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create wallet if it doesn't exist
    let wallet = user.wallet;
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: user.id },
      });
    }

    // For now, return the purchase information
    // In a real implementation, this would integrate with Stripe
    return NextResponse.json({
      success: true,
      purchase: {
        packageId: packageData.id,
        packageName: packageData.name,
        tokens: packageData.tokens,
        priceInCents,
        role,
        userId: user.id,
        walletId: wallet.id,
      },
      message:
        "Purchase information prepared. Stripe integration needed for payment processing.",
    });
  } catch (error) {
    console.error("Purchase preparation error:", error);
    return NextResponse.json(
      { error: "Failed to prepare purchase" },
      { status: 500 }
    );
  }
}
