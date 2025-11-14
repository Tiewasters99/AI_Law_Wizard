import { NextRequest } from "next/server";
import {
  handleUpdateRolePricing,
  handleDeleteRolePricing,
} from "@/lib/backend/controllers/admin/pricing/rolePricingManagementController";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateRolePricing(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDeleteRolePricing(request, id);
}

