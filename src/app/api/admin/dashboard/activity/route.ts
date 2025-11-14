import { NextRequest } from "next/server";
import { handleGetDashboardActivity } from "@/lib/backend/controllers/admin/dashboard/dashboardActivityController";

export async function GET(request: NextRequest) {
  return handleGetDashboardActivity(request);
}
