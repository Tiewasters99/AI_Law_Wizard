import { NextRequest } from "next/server";
import { handleCheckFeature } from "@/lib/backend/controllers/admin/features/featureCheckController";

export async function POST(request: NextRequest) {
  return handleCheckFeature(request);
}
