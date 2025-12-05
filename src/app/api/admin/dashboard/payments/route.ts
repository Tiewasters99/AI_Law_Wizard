import { NextRequest } from "next/server";
import { handleGetPayments } from "@/lib/backend/controllers/admin/dashboard/paymentsController";

export async function GET(request: NextRequest) {
  return handleGetPayments(request);
}
