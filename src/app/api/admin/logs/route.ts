import { NextRequest } from "next/server";
import { handleGetLogs } from "@/lib/backend/controllers/admin/logs/logsController";

export async function GET(request: NextRequest) {
  return handleGetLogs(request);
}
