import { NextRequest } from "next/server";
import { handleListClients } from "@/lib/backend/controllers/admin/clients/clientsController";

export async function GET(request: NextRequest) {
  return handleListClients(request);
}
