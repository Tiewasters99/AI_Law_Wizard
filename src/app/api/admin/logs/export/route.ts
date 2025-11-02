import { NextRequest } from "next/server";
import { handleExportLogs } from "@/lib/backend/controllers/admin/logs/logsExportController";

export async function GET(request: NextRequest) {
  return handleExportLogs(request);
}
