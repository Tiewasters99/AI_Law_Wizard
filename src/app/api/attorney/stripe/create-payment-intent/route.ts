import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";
import { stripe } from "@/lib/backend/stripeServer";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { packageId } = await req.json();

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 }
      );
    }

    // Get the token package
    const tokenPackage = await prisma.tokenPackage.findUnique({
      where: { id: packageId, isActive: true },
    });

    if (!tokenPackage) {
      return NextResponse.json(
        { error: "Invalid or inactive package" },
        { status: 404 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tokenPackage.priceInCents,
      currency: "usd",
      metadata: {
        userId: session.user.id,
        packageId: tokenPackage.id,
        tokens: tokenPackage.tokens.toString(),
      },
      description: `${tokenPackage.name} - ${tokenPackage.tokens} tokens`,
    });

    // Create purchase record
    await prisma.purchase.create({
      data: {
        userId: session.user.id,
        packageId: tokenPackage.id,
        stripePaymentIntent: paymentIntent.id,
        tokensAwarded: tokenPackage.tokens,
        amountPaid: tokenPackage.priceInCents,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
