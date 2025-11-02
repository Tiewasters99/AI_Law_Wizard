// Pricing Packages API Route
// Delegates to controller for handling

import { handleGetPackages } from "@/lib/backend/controllers/pricing/packagesController";

export async function GET() {
  return handleGetPackages();
}
