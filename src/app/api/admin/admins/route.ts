import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/apiProtection";
import { prisma } from "@/lib/backend/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        lastLoginAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error("Admins fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 }
    );
  }
}
