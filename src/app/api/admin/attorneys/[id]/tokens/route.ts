import { NextRequest } from "next/server";
import { handleAdjustAttorneyTokens } from "@/lib/backend/controllers/admin/attorneys/tokenAdjustmentController";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleAdjustAttorneyTokens(request, params.id);
}

