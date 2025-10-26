import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/apiProtection";
import { prisma } from "@/lib/backend/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get("packageId");
    const role = searchParams.get("role");

    if (!packageId || !role) {
      return NextResponse.json(
        { error: "packageId and role are required" },
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

    // Return role-specific price or base price
    const rolePricing = packageData.RolePricing[0];
    const priceInCents = rolePricing
      ? rolePricing.priceInCents
      : packageData.priceInCents;

    return NextResponse.json({ priceInCents });
  } catch (error) {
    console.error("Role pricing check error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to check role pricing" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to check role pricing" },
      { status: 500 }
    );
  }
}
