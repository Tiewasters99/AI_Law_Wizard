import { NextRequest } from "next/server";
import {
  handleUpdatePackage,
  handleDeletePackage,
} from "@/lib/backend/controllers/admin/pricing/packageManagementController";

// Disable caching - admin pricing data must be fresh
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdatePackage(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDeletePackage(request, id);
}
