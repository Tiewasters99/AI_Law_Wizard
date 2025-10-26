import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/apiProtection";
import { prisma } from "@/lib/backend/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const action = searchParams.get("action") || "";
    const dateRange = searchParams.get("dateRange") || "";
    const adminId = searchParams.get("adminId") || "";

    // Build where clause (same as main logs route)
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

    const logs = await prisma.adminActivityLog.findMany({
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

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="admin-logs-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Logs export error:", error);
    return NextResponse.json(
      { error: "Failed to export logs" },
      { status: 500 }
    );
  }
}
