// Repository for admin activity log database operations

import { prisma } from "../../prisma";
import { AdminAction } from "@/types/admin";

export interface AdminActivityLogWithAdmin {
  id: string;
  adminId: string;
  action: AdminAction;
  targetType: string | null;
  targetId: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  admin: {
    name: string | null;
    email: string;
  };
}

export interface LogFilters {
  search?: string;
  action?: string;
  adminId?: string;
  dateRange?: "today" | "week" | "month" | "year";
}

/**
 * Create admin activity log
 */
export async function createAdminActivityLog(data: {
  adminId: string;
  action: AdminAction;
  targetType?: string | null;
  targetId?: string | null;
  details?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  await prisma.adminActivityLog.create({
    data: {
      adminId: data.adminId,
      action: data.action,
      targetType: data.targetType || null,
      targetId: data.targetId || null,
      details: data.details || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
    },
  });
}

/**
 * Find admin activity logs with filters and pagination
 */
export async function findAdminActivityLogs(
  filters: LogFilters,
  page: number,
  limit: number
): Promise<{ logs: AdminActivityLogWithAdmin[]; total: number }> {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.search) {
    where.OR = [
      { action: { contains: filters.search, mode: "insensitive" } },
      { targetType: { contains: filters.search, mode: "insensitive" } },
      { admin: { email: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  if (filters.action) {
    where.action = filters.action;
  }

  if (filters.adminId) {
    where.adminId = filters.adminId;
  }

  if (filters.dateRange) {
    const now = new Date();
    let startDate: Date;

    switch (filters.dateRange) {
      case "today":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    where.createdAt = { gte: startDate };
  }

  const [logs, total] = await Promise.all([
    prisma.adminActivityLog.findMany({
      where,
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.adminActivityLog.count({ where }),
  ]);

  return { logs, total };
}

/**
 * Get recent activity logs
 */
export async function getRecentActivityLogs(
  limit: number = 20
): Promise<AdminActivityLogWithAdmin[]> {
  return await prisma.adminActivityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Get all activity logs for export (with filters, no pagination)
 */
export async function getAllActivityLogsForExport(
  filters: LogFilters
): Promise<AdminActivityLogWithAdmin[]> {
  const where: any = {};

  if (filters.search) {
    where.OR = [
      { action: { contains: filters.search, mode: "insensitive" } },
      { targetType: { contains: filters.search, mode: "insensitive" } },
      { admin: { email: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  if (filters.action) {
    where.action = filters.action;
  }

  if (filters.adminId) {
    where.adminId = filters.adminId;
  }

  if (filters.dateRange) {
    const now = new Date();
    let startDate: Date;

    switch (filters.dateRange) {
      case "today":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    where.createdAt = { gte: startDate };
  }

  return await prisma.adminActivityLog.findMany({
    where,
    include: {
      admin: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

