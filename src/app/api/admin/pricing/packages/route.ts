import { NextRequest } from "next/server";
import {
  handleListPackages,
  handleCreatePackage,
} from "@/lib/backend/controllers/admin/pricing/packagesController";

// Disable caching - admin pricing data must be fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  return handleListPackages(request);
}

export async function POST(request: NextRequest) {
  return handleCreatePackage(request);
}
