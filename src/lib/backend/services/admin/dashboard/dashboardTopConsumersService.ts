// Service for admin dashboard top token consumers

import { prisma } from "../../../prisma";
import { UserTokenSummary } from "@/types/admin";

/**
 * Get top token consumers
 */
export async function getTopTokenConsumers(
  limit: number = 10
): Promise<UserTokenSummary[]> {
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ["ATTORNEY", "CUSTOMER"],
      },
    },
    include: {
      wallet: true,
      tokenTransactions: {
        where: {
          type: "CONSUMPTION",
        },
      },
    },
  });

  const consumers = users
    .map(user => {
      const tokensConsumed = user.tokenTransactions.reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0
      );
      return {
        userId: user.id,
        userName: user.name || user.email || "",
        userRole: user.role as "ATTORNEY" | "CUSTOMER",
        tokensConsumed,
        percentageOfTotal: 0, // Will be calculated after sorting
      };
    })
    .filter(user => user.tokensConsumed > 0)
    .sort((a, b) => b.tokensConsumed - a.tokensConsumed)
    .slice(0, limit);

  // Calculate percentages
  const totalConsumed = consumers.reduce(
    (sum, user) => sum + user.tokensConsumed,
    0
  );
  consumers.forEach(user => {
    user.percentageOfTotal =
      totalConsumed > 0 ? (user.tokensConsumed / totalConsumed) * 100 : 0;
  });

  return consumers;
}
