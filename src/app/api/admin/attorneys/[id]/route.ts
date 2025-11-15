import { NextRequest } from "next/server";
import {
  handleGetAttorney,
  handleUpdateAttorney,
  handleDeleteAttorney,
} from "@/lib/backend/controllers/admin/attorneys/attorneysController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetAttorney(request, id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateAttorney(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDeleteAttorney(request, id);
}
