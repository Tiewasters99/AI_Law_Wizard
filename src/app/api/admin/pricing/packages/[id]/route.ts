import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/apiProtection";
import { prisma } from "@/lib/backend/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth(request);

    const { id } = await params;
    const { name, tokens, priceInCents, description, isActive } =
      await request.json();

    // Validate required fields
    if (!name || !tokens || priceInCents === undefined) {
      return NextResponse.json(
        { error: "Name, tokens, and price are required" },
        { status: 400 }
      );
    }

    const updatedPackage = await prisma.tokenPackage.update({
      where: { id },
      data: {
        name,
        tokens,
        priceInCents,
        description,
        isActive: isActive ?? true,
      },
      include: {
        RolePricing: true,
      },
    });

    return NextResponse.json(updatedPackage);
  } catch (error) {
    console.error("Package update error:", error);
    return NextResponse.json(
      { error: "Failed to update package" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth(request);

    const { id } = await params;

    // Check if package has any purchases
    const purchases = await prisma.purchase.findFirst({
      where: { packageId: id },
    });

    if (purchases) {
      return NextResponse.json(
        { error: "Cannot delete package with existing purchases" },
        { status: 400 }
      );
    }

    // Delete package (role pricing will be deleted due to cascade)
    await prisma.tokenPackage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Package deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete package" },
      { status: 500 }
    );
  }
}
