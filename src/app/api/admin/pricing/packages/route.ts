import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/apiProtection";
import { prisma } from "@/lib/backend/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const packages = await prisma.tokenPackage.findMany({
      include: {
        RolePricing: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error("Packages fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { name, tokens, priceInCents, description, isActive } =
      await request.json();

    // Validate required fields
    if (!name || !tokens || priceInCents === undefined) {
      return NextResponse.json(
        { error: "Name, tokens, and price are required" },
        { status: 400 }
      );
    }

    // Create package with default role pricing
    const newPackage = await prisma.tokenPackage.create({
      data: {
        name,
        tokens,
        priceInCents,
        description,
        isActive: isActive ?? true,
        RolePricing: {
          create: [
            {
              role: "ATTORNEY",
              priceInCents,
              isActive: true,
            },
            {
              role: "CUSTOMER",
              priceInCents,
              isActive: true,
            },
          ],
        },
      },
      include: {
        RolePricing: true,
      },
    });

    return NextResponse.json(newPackage);
  } catch (error) {
    console.error("Package creation error:", error);
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    );
  }
}
