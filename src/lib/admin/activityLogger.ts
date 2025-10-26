import { prisma } from "../backend/prisma";
import { AdminAction } from "@/types/admin";

interface LogAdminActionParams {
  adminId: string;
  action: AdminAction;
  details?: {
    targetType?: string;
    targetId?: string;
    ipAddress?: string;
    userAgent?: string;
    additionalDetails?: any;
  };
}

export async function logAdminAction({
  adminId,
  action,
  details = {},
}: LogAdminActionParams): Promise<void> {
  try {
    await prisma.adminActivityLog.create({
      data: {
        adminId,
        action,
        targetType: details.targetType || null,
        targetId: details.targetId || null,
        details: details.additionalDetails || null,
        ipAddress: details.ipAddress || null,
        userAgent: details.userAgent || null,
      },
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
    // Don't throw - logging failures shouldn't break the main operation
  }
}

export async function getAdminActivityLogs(
  adminId: string,
  limit: number = 50,
  offset: number = 0
) {
  return await prisma.adminActivityLog.findMany({
    where: { adminId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export async function getRecentActivity(limit: number = 20) {
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
