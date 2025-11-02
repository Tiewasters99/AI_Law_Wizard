import { NextRequest } from "next/server";
import {
  handleUpdatePackage,
  handleDeletePackage,
} from "@/lib/backend/controllers/admin/pricing/packageManagementController";

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
