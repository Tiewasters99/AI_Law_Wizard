import { NextRequest } from "next/server";
import { handleAdjustClientTokens } from "@/lib/backend/controllers/admin/clients/tokenAdjustmentController";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleAdjustClientTokens(request, params.id);
}

