import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/backend/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { featureName, role } = body;

    if (!featureName || !role) {
      return NextResponse.json(
        { error: "featureName and role are required" },
        { status: 400 }
      );
    }

    if (!["ATTORNEY", "CUSTOMER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const feature = await prisma.feature.findUnique({
      where: { name: featureName },
      include: {
        roleSpecific: {
          where: { role: role as "ATTORNEY" | "CUSTOMER" },
        },
      },
    });

    if (!feature) {
      return NextResponse.json({ enabled: false });
    }

    // Check global enabled state
    if (!feature.isGlobal || !feature.isEnabled) {
      return NextResponse.json({ enabled: false });
    }

    // Check role-specific enabled state
    const roleSpecific = feature.roleSpecific[0];
    const enabled = roleSpecific ? roleSpecific.isEnabled : true;

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error("Feature check error:", error);
    return NextResponse.json(
      { error: "Failed to check feature status" },
      { status: 500 }
    );
  }
}
