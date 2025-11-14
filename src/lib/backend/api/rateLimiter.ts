// Rate limiting utility for API endpoints

import { NextRequest } from "next/server";
import { RATE_LIMITS, getUserTier } from "./config";
import { UserRole } from "@/types/api";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (in production, use Redis or similar)
const rateLimitStore: RateLimitStore = {};

export function checkRateLimit(
  request: NextRequest,
  userId: string | null,
  role: UserRole,
  isAuthenticated: boolean
): { allowed: boolean; remaining: number; resetTime: number } {
  const tier = getUserTier(role, isAuthenticated);
  const limit = RATE_LIMITS[tier];

  // Use IP address for guests, user ID for authenticated users
  const key = isAuthenticated ? `user:${userId}` : `ip:${getClientIP(request)}`;
  const now = Date.now();

  const current = rateLimitStore[key];

  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + limit.window * 1000,
    };
    return {
      allowed: true,
      remaining: limit.requests - 1,
      resetTime: rateLimitStore[key].resetTime,
    };
  }

  if (current.count >= limit.requests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }

  // Increment counter
  current.count++;

  return {
    allowed: true,
    remaining: limit.requests - current.count,
    resetTime: current.resetTime,
  };
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

export function getRateLimitHeaders(remaining: number, resetTime: number) {
  return {
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
  };
}
