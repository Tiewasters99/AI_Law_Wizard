// Repository for admin database operations

import { prisma } from "../../prisma";

export interface AdminListItem {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  lastLoginAt: Date | null;
}

/**
 * Find all admins
 */
export async function findAllAdmins(): Promise<AdminListItem[]> {
  return await prisma.admin.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      lastLoginAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
