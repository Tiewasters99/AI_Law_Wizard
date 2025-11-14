import { NextRequest } from "next/server";
import { handleGetRolePricing } from "@/lib/backend/controllers/admin/pricing/rolePricingController";

export async function GET(request: NextRequest) {
  return handleGetRolePricing(request);
}
