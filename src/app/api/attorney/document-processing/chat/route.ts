// Attorney Document Processing Chat API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import {
  handleChatMessage,
  handleGetChatSession,
} from "@/lib/backend/controllers/attorney/documentProcessing/documentChatController";

export async function POST(request: NextRequest) {
  return handleChatMessage(request);
}

export async function GET(request: NextRequest) {
  return handleGetChatSession(request);
}
