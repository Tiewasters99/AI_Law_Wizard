import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/backend/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    if (!role || !["ATTORNEY", "CUSTOMER"].includes(role)) {
      return NextResponse.json(
        { error: "Valid role parameter is required (ATTORNEY or CUSTOMER)" },
        { status: 400 }
      );
    }

    // Fetch active token packages with role-specific pricing
    const packages = await prisma.tokenPackage.findMany({
      where: {
        isActive: true,
      },
      include: {
        RolePricing: {
          where: {
            role: role as "ATTORNEY" | "CUSTOMER",
            isActive: true,
          },
        },
      },
      orderBy: {
        priceInCents: "asc",
      },
    });

    // Transform the data, using role-specific pricing if available, otherwise base price
    const transformedPackages = packages.map(pkg => {
      const rolePricing = pkg.RolePricing[0];
      const finalPrice = rolePricing
        ? rolePricing.priceInCents
        : pkg.priceInCents;

      return {
        id: pkg.id,
        name: pkg.name,
        tokens: pkg.tokens,
        priceInCents: finalPrice,
        originalPriceInCents: pkg.priceInCents,
        hasRoleDiscount:
          rolePricing && rolePricing.priceInCents !== pkg.priceInCents,
        description: pkg.description,
        isActive: pkg.isActive,
      };
    });

    return NextResponse.json({
      role,
      packages: transformedPackages,
    });
  } catch (error) {
    console.error("Role-specific pricing fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch role-specific pricing" },
      { status: 500 }
    );
  }
}
