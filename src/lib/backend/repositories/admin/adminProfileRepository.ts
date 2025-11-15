// Repository for admin profile database operations

import { prisma } from "../../prisma";
import { Admin } from "@/types/admin";

/**
 * Find admin by email
 */
export async function findAdminByEmail(email: string): Promise<Admin | null> {
  return await prisma.admin.findUnique({
    where: { email },
  });
}
