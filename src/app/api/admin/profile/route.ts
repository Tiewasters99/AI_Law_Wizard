import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/apiProtection";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdminAuth(request);

    return NextResponse.json(admin);
  } catch (error) {
    console.error("Admin profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin profile" },
      { status: 500 }
    );
  }
}
