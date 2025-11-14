import { NextRequest } from "next/server";
import {
  handleListPackages,
  handleCreatePackage,
} from "@/lib/backend/controllers/admin/pricing/packagesController";

export async function GET(request: NextRequest) {
  return handleListPackages(request);
}

export async function POST(request: NextRequest) {
  return handleCreatePackage(request);
}
