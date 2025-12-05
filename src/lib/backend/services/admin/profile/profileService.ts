// Service for admin profile functionality

import {
  findAdminByEmail,
  findAdminById,
  findAdminByIdWithPassword,
  updateAdminById,
  updateAdminPasswordById,
} from "../../../repositories/admin/adminProfileRepository";
import { NotFoundError, ValidationError, ConflictError } from "../../../utils/errors";
import { validateEmail } from "../../../utils/validation";
import bcrypt from "bcryptjs";

/**
 * Get admin profile by email
 */
export async function getAdminProfile(email: string) {
  const admin = await findAdminByEmail(email);

  if (!admin) {
    throw new NotFoundError("Admin profile");
  }

  return admin;
}

/**
 * Update admin profile
 */
export async function updateAdminProfile(
  adminId: string,
  data: {
    name?: string | null;
    email?: string;
    image?: string | null;
  }
) {
  // Verify admin exists
  const admin = await findAdminById(adminId);
  if (!admin) {
    throw new NotFoundError("Admin profile");
  }

  const updateData: {
    name?: string | null;
    email?: string;
    image?: string | null;
  } = {};

  // Update name if provided
  if (data.name !== undefined) {
    updateData.name = data.name?.trim() || null;
  }

  // Update email if provided (with validation and uniqueness check)
  if (data.email !== undefined) {
    const email = validateEmail(data.email.trim(), "Email");
    
    // Check if email is already taken by another admin
    const existingAdmin = await findAdminByEmail(email);
    if (existingAdmin && existingAdmin.id !== adminId) {
      throw new ConflictError("Email is already in use by another admin");
    }
    
    updateData.email = email;
  }

  // Update image if provided
  if (data.image !== undefined) {
    updateData.image = data.image?.trim() || null;
  }

  return await updateAdminById(adminId, updateData);
}

/**
 * Update admin password
 */
export async function updateAdminPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string
) {
  // Verify admin exists and get password
  const admin = await findAdminByIdWithPassword(adminId);
  if (!admin) {
    throw new NotFoundError("Admin profile");
  }

  // Validate current password
  if (!currentPassword) {
    throw new ValidationError("Current password is required");
  }

  // Validate new password
  if (!newPassword) {
    throw new ValidationError("New password is required");
  }

  if (newPassword.length < 8) {
    throw new ValidationError("New password must be at least 8 characters long");
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
  if (!isPasswordValid) {
    throw new ValidationError("Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  return await updateAdminPasswordById(adminId, hashedPassword);
}
