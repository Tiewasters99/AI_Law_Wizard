import { NextRequest } from "next/server";
import { handleAdjustClientTokens } from "@/lib/backend/controllers/admin/clients/tokenAdjustmentController";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleAdjustClientTokens(request, id);
}
