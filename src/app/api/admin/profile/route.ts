import { NextRequest } from "next/server";
import {
  handleGetProfile,
  handleUpdateProfile,
} from "@/lib/backend/controllers/admin/profile/profileController";

export async function GET(request: NextRequest) {
  return handleGetProfile(request);
}

export async function PATCH(request: NextRequest) {
  return handleUpdateProfile(request);
}
