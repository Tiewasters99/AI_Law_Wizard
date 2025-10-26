import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/apiProtection";
import { getTopTokenConsumers } from "@/lib/admin/tokenUtils";

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const range =
      (searchParams.get("range") as "7d" | "30d" | "90d" | undefined) || "30d";
    const limit = parseInt(searchParams.get("limit") || "10");

    // For now, we'll use the same function regardless of range
    // In a real implementation, you'd modify getTopTokenConsumers to accept date filters
    const consumers = await getTopTokenConsumers(limit);

    return NextResponse.json(consumers);
  } catch (error) {
    console.error("Top consumers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch top consumers data" },
      { status: 500 }
    );
  }
}
