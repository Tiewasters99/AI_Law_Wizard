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

/**
 * Find admin by ID
 */
export async function findAdminById(id: string): Promise<Admin | null> {
  return await prisma.admin.findUnique({
    where: { id },
  });
}

/**
 * Find admin by ID with password (for internal use)
 */
export async function findAdminByIdWithPassword(
  id: string
): Promise<(Admin & { password: string }) | null> {
  return await prisma.admin.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      image: true,
      isSuperAdmin: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Update admin profile by ID
 */
export async function updateAdminById(
  id: string,
  data: {
    name?: string | null;
    email?: string;
    image?: string | null;
  }
): Promise<Admin> {
  return await prisma.admin.update({
    where: { id },
    data,
  });
}

/**
 * Update admin password by ID
 */
export async function updateAdminPasswordById(
  id: string,
  hashedPassword: string
): Promise<Admin> {
  return await prisma.admin.update({
    where: { id },
    data: { password: hashedPassword },
  });
}
