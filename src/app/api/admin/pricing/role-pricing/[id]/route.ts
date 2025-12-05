import { NextRequest } from "next/server";
import {
  handleUpdateRolePricing,
  handleDeleteRolePricing,
} from "@/lib/backend/controllers/admin/pricing/rolePricingManagementController";

// Disable caching - admin pricing data must be fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
