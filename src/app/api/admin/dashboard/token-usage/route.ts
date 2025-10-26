import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/apiProtection";
import { getConsumptionTrends } from "@/lib/admin/tokenUtils";

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const range =
      (searchParams.get("range") as "7d" | "30d" | "90d" | "1y") || "30d";

    let days = 30;
    switch (range) {
      case "7d":
        days = 7;
        break;
      case "30d":
        days = 30;
        break;
      case "90d":
        days = 90;
        break;
      case "1y":
        days = 365;
        break;
    }

    const trends = await getConsumptionTrends(days);

    return NextResponse.json(trends);
  } catch (error) {
    console.error("Token usage chart error:", error);
    return NextResponse.json(
      { error: "Failed to fetch token usage data" },
      { status: 500 }
    );
  }
}
