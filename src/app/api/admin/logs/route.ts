import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/apiProtection";
import { prisma } from "@/lib/backend/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const action = searchParams.get("action") || "";
    const dateRange = searchParams.get("dateRange") || "";
    const adminId = searchParams.get("adminId") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { targetType: { contains: search, mode: "insensitive" } },
        { admin: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (action) {
      where.action = action;
    }

    if (adminId) {
      where.adminId = adminId;
    }

    if (dateRange) {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
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

      where.createdAt = {
        gte: startDate,
      };
    }

    const [logs, totalCount] = await Promise.all([
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

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      logs,
      totalPages,
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    console.error("Logs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
