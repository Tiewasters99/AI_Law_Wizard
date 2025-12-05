import { NextRequest } from "next/server";
import { handleAdjustAttorneyTokens } from "@/lib/backend/controllers/admin/attorneys/tokenAdjustmentController";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleAdjustAttorneyTokens(request, id);
}
