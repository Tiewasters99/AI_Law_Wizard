// API route for attorney communities

import { NextRequest } from "next/server";
import {
  handleListMyCommunities,
  handleCreateCommunity,
} from "@/lib/backend/controllers/attorney/community/communityController";

export async function GET(request: NextRequest) {
  return await handleListMyCommunities(request);
}

export async function POST(request: NextRequest) {
  return await handleCreateCommunity(request);
}




