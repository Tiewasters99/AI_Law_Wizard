// Service for admin activity logs

import {
  findAdminActivityLogs,
  LogFilters,
} from "../../../repositories/admin/adminActivityRepository";

/**
 * Get paginated activity logs with filters
 */
export async function getActivityLogs(
  filters: LogFilters,
  page: number = 1,
  limit: number = 20
) {
  const { logs, total } = await findAdminActivityLogs(filters, page, limit);

  const totalPages = Math.ceil(total / limit);

  return {
    logs,
    totalPages,
    currentPage: page,
    totalCount: total,
  };
}

