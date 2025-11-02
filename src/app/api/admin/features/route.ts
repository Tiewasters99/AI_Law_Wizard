import { NextRequest } from "next/server";
import { handleListFeatures } from "@/lib/backend/controllers/admin/features/featuresController";

export async function GET(request: NextRequest) {
  return handleListFeatures(request);
}
