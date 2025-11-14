// Service for admin management functionality

import { findAllAdmins } from "../../../repositories/admin/adminRepository";

/**
 * List all admins
 */
export async function listAdmins() {
  return await findAllAdmins();
}

