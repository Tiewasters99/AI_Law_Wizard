// Utility for attorney authentication and authorization

import { prisma } from "../prisma";
import { AuthenticationError, AuthorizationError } from "./errors";

/**
 * Verify user is authenticated and has attorney role
 */
export async function verifyAttorneyAccess(
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

  if (user.role !== "ATTORNEY") {
    throw new AuthorizationError("Attorney access required");
  }

  return user;
}
