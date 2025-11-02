import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await params;

    // Fetch consultation request
    const consultationRequest = await prisma.consultationRequest.findFirst({
      where: {
        id: requestId,
        clientId: session.user.id,
      },
      include: {
        attorney: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            lawyerProfile: {
              select: {
                bio: true,
                practiceAreas: true,
                firmName: true,
                yearsOfExperience: true,
                location: true,
                hourlyRate: true,
              },
            },
          },
        },
        conversation: {
          select: {
            id: true,
            lastMessageAt: true,
            unreadByClient: true,
            unreadByAttorney: true,
          },
        },
      },
    });

    if (!consultationRequest) {
      return NextResponse.json(
        { error: "Consultation request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      request: consultationRequest,
    });
  } catch (error) {
    console.error("Error fetching consultation request:", error);
    return NextResponse.json(
      { error: "Failed to fetch consultation request" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await params;
    const { status } = await request.json();

    // Validate status
    const validStatuses = [
      "pending",
      "accepted",
      "in-progress",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Verify consultation request belongs to user
    const consultationRequest = await prisma.consultationRequest.findFirst({
      where: {
        id: requestId,
        clientId: session.user.id,
      },
      include: {
        conversation: true,
      },
    });

    if (!consultationRequest) {
      return NextResponse.json(
        { error: "Consultation request not found" },
        { status: 404 }
      );
    }

    // Only allow client to cancel their own requests
    if (status === "cancelled" && consultationRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "Can only cancel pending requests" },
        { status: 400 }
      );
    }

    // Update consultation request
    const updatedRequest = await prisma.consultationRequest.update({
      where: { id: requestId },
      data: { status },
      include: {
        attorney: {
          select: {
            id: true,
            name: true,
            image: true,
            lawyerProfile: {
              select: {
                practiceAreas: true,
                firmName: true,
              },
            },
          },
        },
        conversation: {
          select: {
            id: true,
            lastMessageAt: true,
            unreadByClient: true,
          },
        },
      },
    });

    // Create notification for attorney if cancelled
    if (status === "cancelled") {
      await prisma.notification.create({
        data: {
          userId: consultationRequest.attorneyId,
          type: "REQUEST_CANCELLED",
          title: "Consultation Request Cancelled",
          message: `${session.user.name || "A client"} cancelled their consultation request`,
          relatedId: consultationRequest.conversation?.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: "Consultation request updated successfully",
    });
  } catch (error) {
    console.error("Error updating consultation request:", error);
    return NextResponse.json(
      { error: "Failed to update consultation request" },
      { status: 500 }
    );
  }
}
