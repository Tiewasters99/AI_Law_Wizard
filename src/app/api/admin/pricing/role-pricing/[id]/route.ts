import { NextRequest, NextResponse } from "next/server";
import {
  requireAdminAuth,
  getClientIP,
  getUserAgent,
} from "@/lib/admin/apiProtection";
import { logAdminAction } from "@/lib/admin/activityLogger";
import { prisma } from "@/lib/backend/prisma";
import { z } from "zod";

const updateRolePricingSchema = z.object({
  priceInCents: z.number().int().positive(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminAuth(request);
    const { id } = await params;
    const body = await request.json();

    const validated = updateRolePricingSchema.parse(body);

    const rolePricing = await prisma.rolePricing.update({
      where: { id },
      data: {
        priceInCents: validated.priceInCents,
      },
      include: {
        package: true,
      },
    });

    // Log the action
    await logAdminAction({
      adminId: admin.id,
      action: "ROLE_PRICING_UPDATED",
      details: {
        targetType: "RolePricing",
        targetId: id,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        additionalDetails: {
          packageId: rolePricing.packageId,
          role: rolePricing.role,
          priceInCents: validated.priceInCents,
        },
      },
    });

    return NextResponse.json(rolePricing);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Role pricing update error:", error);
    return NextResponse.json(
      { error: "Failed to update role pricing" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminAuth(request);
    const { id } = await params;

    const rolePricing = await prisma.rolePricing.delete({
      where: { id },
      include: {
        package: true,
      },
    });

    // Log the action
    await logAdminAction({
      adminId: admin.id,
      action: "ROLE_PRICING_UPDATED", // Using same action for deletion
      details: {
        targetType: "RolePricing",
        targetId: id,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        additionalDetails: {
          packageId: rolePricing.packageId,
          role: rolePricing.role,
          action: "deleted",
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Role pricing deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete role pricing" },
      { status: 500 }
    );
  }
}
