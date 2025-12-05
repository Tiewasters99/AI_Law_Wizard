// Service for admin dashboard activity

import { getRecentActivityLogs } from "../../../repositories/admin/adminActivityRepository";

/**
 * Get recent admin activity
 */
export async function getRecentActivity(limit: number = 20) {
  return await getRecentActivityLogs(limit);
}
