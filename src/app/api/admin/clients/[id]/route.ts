import { NextRequest } from "next/server";
import {
  handleGetClient,
  handleUpdateClient,
  handleDeleteClient,
} from "@/lib/backend/controllers/admin/clients/clientsController";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleGetClient(request, params.id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleUpdateClient(request, params.id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleDeleteClient(request, params.id);
}

