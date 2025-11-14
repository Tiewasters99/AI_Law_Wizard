import { NextRequest } from "next/server";
import { handleToggleFeature } from "@/lib/backend/controllers/admin/features/featureToggleController";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleToggleFeature(request, id);
}
