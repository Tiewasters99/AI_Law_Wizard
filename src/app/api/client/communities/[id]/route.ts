// API route for client community operations

import { NextRequest } from "next/server";
import {
  handleGetCommunityDetails,
} from "@/lib/backend/controllers/client/community/communityController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleGetCommunityDetails(request, id);
}










