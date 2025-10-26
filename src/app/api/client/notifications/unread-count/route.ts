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

    const isClient = session.user.role === "CUSTOMER";

    if (!isClient) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Count unread notifications for the current client
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

    // Count unread messages in conversations
    const unreadMessages = await prisma.message.count({
      where: {
        conversation: {
          clientId: session.user.id,
        },
        isRead: false,
      },
    });

    // Count pending consultation requests
    const pendingRequests = await prisma.consultationRequest.count({
      where: {
        clientId: session.user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      notifications: unreadCount,
      messages: unreadMessages,
      pendingRequests: pendingRequests,
      total: unreadCount + unreadMessages + pendingRequests,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching client notification counts:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch notification counts",
        notifications: 0,
        messages: 0,
        pendingRequests: 0,
        total: 0,
      },
      { status: 500 }
    );
  }
}
