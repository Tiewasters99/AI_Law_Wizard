// Attorney Document Processing File Content API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import {
  handleGetFileContent,
  handleGetFileContentGet,
} from "@/lib/backend/controllers/attorney/documentProcessing/fileContentController";

export async function POST(request: NextRequest) {
  return handleGetFileContent(request);
}

export async function GET(request: NextRequest) {
  return handleGetFileContentGet(request);
}
