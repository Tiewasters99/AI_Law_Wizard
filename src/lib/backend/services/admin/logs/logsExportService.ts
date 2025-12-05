// Service for admin activity logs export

import {
  getAllActivityLogsForExport,
  LogFilters,
} from "../../../repositories/admin/adminActivityRepository";

/**
 * Export activity logs as CSV string
 */
export async function exportActivityLogsAsCSV(
  filters: LogFilters
): Promise<string> {
  const logs = await getAllActivityLogsForExport(filters);

  // Generate CSV content
  const csvHeaders = [
    "ID",
    "Action",
    "Admin Name",
    "Admin Email",
    "Target Type",
    "Target ID",
    "IP Address",
    "User Agent",
    "Created At",
  ];

  const csvRows = logs.map(log => [
    log.id,
    log.action,
    log.admin.name || "",
    log.admin.email,
    log.targetType || "",
    log.targetId || "",
    log.ipAddress || "",
    log.userAgent || "",
    log.createdAt.toISOString(),
  ]);

  const csvContent = [
    csvHeaders.join(","),
    ...csvRows.map(row =>
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}
