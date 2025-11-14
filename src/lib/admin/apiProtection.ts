import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "../backend/auth";
import { prisma } from "../backend/prisma";
import { Admin } from "@/types/admin";

export async function requireAdminAuth(request: NextRequest): Promise<Admin> {
  const session = await getServerSession(authOptions);

  if (!session?.isAdmin || !session?.user?.email) {
    throw new Error("Unauthorized: Admin privileges required");
  }

  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  });

  if (!admin || !admin.isActive) {
    throw new Error("Unauthorized: Admin account inactive");
  }

  return admin;
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "127.0.0.1";
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "Unknown";
}
