import { NextRequest, NextResponse } from "next/server";
import {
  requireAdminAuth,
  getClientIP,
  getUserAgent,
} from "@/lib/admin/apiProtection";
import { logAdminAction } from "@/lib/admin/activityLogger";
import { prisma } from "@/lib/backend/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") as "ATTORNEY" | "CUSTOMER" | null;

    const features = await prisma.feature.findMany({
      include: {
        roleSpecific: true,
      },
      orderBy: [{ category: "asc" }, { displayName: "asc" }],
    });

    // Filter by role if specified
    const filteredFeatures = role
      ? features.filter(feature =>
          feature.roleSpecific.some(fr => fr.role === role)
        )
      : features;

    return NextResponse.json(filteredFeatures);
  } catch (error) {
    console.error("Features list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 }
    );
  }
}
