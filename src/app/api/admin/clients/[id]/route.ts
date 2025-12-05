import { NextRequest } from "next/server";
import {
  handleGetClient,
  handleUpdateClient,
  handleDeleteClient,
} from "@/lib/backend/controllers/admin/clients/clientsController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetClient(request, id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateClient(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDeleteClient(request, id);
}
