import { NextRequest } from "next/server";
import { handleGetDashboardTokenUsage } from "@/lib/backend/controllers/admin/dashboard/dashboardTokenUsageController";

export async function GET(request: NextRequest) {
  return handleGetDashboardTokenUsage(request);
}
