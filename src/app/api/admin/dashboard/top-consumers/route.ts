import { NextRequest } from "next/server";
import { handleGetDashboardTopConsumers } from "@/lib/backend/controllers/admin/dashboard/dashboardTopConsumersController";

export async function GET(request: NextRequest) {
  return handleGetDashboardTopConsumers(request);
}
