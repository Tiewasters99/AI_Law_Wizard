// API route for client communities

import { NextRequest } from "next/server";
import {
  handleListCommunities,
} from "@/lib/backend/controllers/client/community/communityController";

export async function GET(request: NextRequest) {
  return await handleListCommunities(request);
}












