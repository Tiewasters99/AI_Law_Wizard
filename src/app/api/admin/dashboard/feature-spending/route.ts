import { NextRequest } from "next/server";
import { handleGetFeatureSpending } from "@/lib/backend/controllers/admin/dashboard/featureSpendingController";

export async function GET(request: NextRequest) {
  return handleGetFeatureSpending(request);
}

