import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/backend/prisma";

export async function GET(request: NextRequest) {
  try {
    // Fetch active token packages with role pricing
    const packages = await prisma.tokenPackage.findMany({
      where: {
        isActive: true,
      },
      include: {
        RolePricing: {
          where: {
            isActive: true,
          },
        },
      },
      orderBy: {
        priceInCents: "asc", // Order by price ascending
      },
    });

    // Transform the data for frontend consumption
    const transformedPackages = packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      tokens: pkg.tokens,
      priceInCents: pkg.priceInCents,
      description: pkg.description,
      isActive: pkg.isActive,
      RolePricing: pkg.RolePricing.map(rp => ({
        id: rp.id,
        role: rp.role,
        priceInCents: rp.priceInCents,
        isActive: rp.isActive,
      })),
    }));

    return NextResponse.json(transformedPackages);
  } catch (error) {
    console.error("Pricing packages fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing packages" },
      { status: 500 }
    );
  }
}
