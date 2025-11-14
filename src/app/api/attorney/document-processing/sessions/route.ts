// Attorney Document Processing Sessions API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import {
  handleCreateSession,
  handleGetSession,
  handleUpdateSession,
  handleDeleteSession,
} from "@/lib/backend/controllers/attorney/documentProcessing/documentSessionController";

export async function POST(request: NextRequest) {
  return handleCreateSession(request);
}

export async function GET(request: NextRequest) {
  return handleGetSession(request);
}

export async function PUT(request: NextRequest) {
  return handleUpdateSession(request);
}

export async function DELETE(request: NextRequest) {
  return handleDeleteSession(request);
}
