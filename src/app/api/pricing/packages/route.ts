// Pricing Packages API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import { handleGetPackages } from "@/lib/backend/controllers/pricing/packagesController";

export async function GET(request: NextRequest) {
  return handleGetPackages(request);
}
