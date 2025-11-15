// Service for admin profile functionality

import { findAdminByEmail } from "../../../repositories/admin/adminProfileRepository";
import { NotFoundError } from "../../../utils/errors";

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
