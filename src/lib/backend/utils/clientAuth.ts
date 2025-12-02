// Utility functions for client role validation

import { prisma } from "../prisma";
import { AuthenticationError, AuthorizationError } from "./errors";

/**
 * Verify that the user is a client (CUSTOMER role)
 */
export async function verifyClientAccess(
  userId: string | undefined
): Promise<{ id: string; role: string }> {
  if (!userId) {
    throw new AuthenticationError("Authentication required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new AuthenticationError("User not found");
  }

  if (!user.role) {
    throw new AuthorizationError("Client access required");
  }

  if (user.role !== "CUSTOMER") {
    throw new AuthorizationError("Client access required");
  }

  // At this point, we've verified user.role is "CUSTOMER"
  return {
    id: user.id,
    role: "CUSTOMER",
  };
}

/**
 * Check if user is a client (does not throw, returns boolean)
 */
export async function isClient(userId: string): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === "CUSTOMER";
}
