import { NextRequest } from "next/server";
import { handleGetRolePricing } from "@/lib/backend/controllers/admin/pricing/rolePricingController";
import { handleCreateRolePricing } from "@/lib/backend/controllers/admin/pricing/rolePricingManagementController";

// Disable caching - admin pricing data must be fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  return handleGetRolePricing(request);
}

export async function POST(request: NextRequest) {
  return handleCreateRolePricing(request);
}
