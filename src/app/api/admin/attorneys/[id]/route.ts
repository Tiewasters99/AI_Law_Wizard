import { NextRequest } from "next/server";
import {
  handleGetAttorney,
  handleUpdateAttorney,
  handleDeleteAttorney,
} from "@/lib/backend/controllers/admin/attorneys/attorneysController";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleGetAttorney(request, params.id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleUpdateAttorney(request, params.id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleDeleteAttorney(request, params.id);
}

