import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAttorney = session.user.role === "ATTORNEY";

    if (!isAttorney) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Count unread notifications for the current user
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      count: unreadCount,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch unread count",
        count: 0,
      },
      { status: 500 }
    );
  }
}
