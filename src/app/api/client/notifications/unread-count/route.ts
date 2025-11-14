// Client Notifications Unread Count API Route
// Delegates to controller for handling

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { handleGetUnreadCounts } from "@/lib/backend/controllers/client/notifications/notificationsController";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Ensure we always return a valid JSON response
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          code: "AUTHENTICATION_ERROR",
        },
        { status: 401 }
      );
    }

    return handleGetUnreadCounts(session.user.id);
  } catch (error) {
    // Fallback error handler to ensure we always return JSON
    console.error("Unexpected error in notifications route:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
