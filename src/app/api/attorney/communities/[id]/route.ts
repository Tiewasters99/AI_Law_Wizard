// API route for attorney community operations

import { NextRequest } from "next/server";
import {
  handleGetCommunityDetails,
  handleUpdateCommunity,
  handleDeleteCommunity,
} from "@/lib/backend/controllers/attorney/community/communityController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleGetCommunityDetails(request, id);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleUpdateCommunity(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleDeleteCommunity(request, id);
}




