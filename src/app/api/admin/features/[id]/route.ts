import { NextRequest, NextResponse } from "next/server";
import {
  requireAdminAuth,
  getClientIP,
  getUserAgent,
} from "@/lib/admin/apiProtection";
import { logAdminAction } from "@/lib/admin/activityLogger";
import { prisma } from "@/lib/backend/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminAuth(request);
    const { id } = await params;

    const body = await request.json();
    const { isEnabled, role } = body;

    if (typeof isEnabled !== "boolean") {
      return NextResponse.json(
        { error: "isEnabled must be a boolean" },
        { status: 400 }
      );
    }

    // Update global feature state
    const updatedFeature = await prisma.feature.update({
      where: { id },
      data: { isEnabled },
      include: {
        roleSpecific: true,
      },
    });

    // If role is specified, update role-specific state
    if (role && ["ATTORNEY", "CUSTOMER"].includes(role)) {
      await prisma.featureRole.upsert({
        where: {
          featureId_role: {
            featureId: id,
            role: role as "ATTORNEY" | "CUSTOMER",
          },
        },
        update: { isEnabled },
        create: {
          featureId: id,
          role: role as "ATTORNEY" | "CUSTOMER",
          isEnabled,
        },
      });
    }

    // Log the action
    await logAdminAction({
      adminId: admin.id,
      action: "FEATURE_TOGGLED",
      details: {
        targetType: "Feature",
        targetId: id,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        additionalDetails: {
          featureName: updatedFeature.name,
          isEnabled,
          role: role || "global",
        },
      },
    });

    return NextResponse.json(updatedFeature);
  } catch (error) {
    console.error("Feature toggle error:", error);
    return NextResponse.json(
      { error: "Failed to toggle feature" },
      { status: 500 }
    );
  }
}
