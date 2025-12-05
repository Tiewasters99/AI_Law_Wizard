import { NextRequest } from "next/server";
import { handleListAttorneys } from "@/lib/backend/controllers/admin/attorneys/attorneysController";

export async function GET(request: NextRequest) {
  return handleListAttorneys(request);
}
