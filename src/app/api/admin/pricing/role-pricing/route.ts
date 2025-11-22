import { NextRequest } from "next/server";
import { handleGetRolePricing } from "@/lib/backend/controllers/admin/pricing/rolePricingController";
import { handleCreateRolePricing } from "@/lib/backend/controllers/admin/pricing/rolePricingManagementController";

export async function GET(request: NextRequest) {
  return handleGetRolePricing(request);
}

export async function POST(request: NextRequest) {
  return handleCreateRolePricing(request);
}
