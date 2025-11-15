// Utility functions for admin authentication and request utilities

import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "../auth";
import { AuthenticationError, AuthorizationError } from "./errors";
import { Admin } from "@/types/admin";
import { prisma } from "../prisma";

/**
 * Verify admin authentication and return admin object
 */
export async function requireAdminAuth(request: NextRequest): Promise<Admin> {
  const session = await getServerSession(authOptions);

  if (!session?.isAdmin || !session?.user?.email) {
    throw new AuthenticationError("Admin privileges required");
  }

  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  });

  if (!admin) {
    throw new AuthenticationError("Admin account not found");
  }

  if (!admin.isActive) {
    throw new AuthorizationError("Admin account inactive");
  }

  return admin;
}

/**
 * Get client IP address from request headers
 */
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

/**
 * Get user agent from request headers
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "Unknown";
}
