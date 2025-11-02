import { NextRequest } from "next/server";
import { handleGetDashboardStats } from "@/lib/backend/controllers/admin/dashboard/dashboardStatsController";

export async function GET(request: NextRequest) {
  return handleGetDashboardStats(request);
}
