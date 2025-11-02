import { NextRequest } from "next/server";
import { handleRegister } from "@/lib/backend/controllers/auth/registrationController";

export async function POST(request: NextRequest) {
  return handleRegister(request);
}
