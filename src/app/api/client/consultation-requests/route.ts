import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";
import { deductTokens } from "@/lib/backend/tokenService";

const CONSULTATION_REQUEST_COST = 10; // tokens

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const userId = session?.user?.id;
    const userRole = session?.user?.role;
    if (!userId || !userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isClient = userRole === "CUSTOMER";
    if (!isClient) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { attorneyId, caseType, urgency, description, attachmentUrls } =
      await request.json();

    // Validate required fields
    if (!attorneyId || !caseType || !description?.trim()) {
      return NextResponse.json(
        { error: "Attorney ID, case type, and description are required" },
        { status: 400 }
      );
    }

    // Validate urgency
    const validUrgencyLevels = ["low", "medium", "high", "urgent"];
    if (!validUrgencyLevels.includes(urgency)) {
      return NextResponse.json(
        { error: "Invalid urgency level" },
        { status: 400 }
      );
    }

    // Verify attorney exists and is available
    const attorney = await prisma.user.findFirst({
      where: {
        id: attorneyId,
        role: "ATTORNEY",
        profileComplete: true,
      },
      include: {
        lawyerProfile: true,
      },
    });

    if (!attorney) {
      return NextResponse.json(
        { error: "Attorney not found or not available" },
        { status: 404 }
      );
    }

    // Deduct tokens
    const tokenResult = await deductTokens(
      userId,
      CONSULTATION_REQUEST_COST,
      `Consultation request to ${attorney.name}`
    );

    if (!tokenResult.success) {
      return NextResponse.json(
        { error: tokenResult.error || "Insufficient token balance" },
        { status: 402 }
      );
    }

    // Create consultation request and conversation in a transaction
    const result = await prisma.$transaction(async tx => {
      // Create consultation request
      const consultationRequest = await tx.consultationRequest.create({
        data: {
          clientId: userId,
          attorneyId,
          caseType,
          urgency,
          description: description.trim(),
          documents: attachmentUrls || [],
          status: "PENDING",
        },
      });

      // Create conversation
      const conversation = await tx.conversation.create({
        data: {
          clientId: userId,
          attorneyId,
          consultationRequestId: consultationRequest.id,
          unreadByClient: 0,
          unreadByAttorney: 1,
        },
      });

      // Create initial message from client
      const initialMessage = await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          content: `Consultation Request: ${caseType}\n\nDescription: ${description.trim()}\n\nUrgency: ${urgency}`,
          attachments: attachmentUrls || null,
        },
      });

      // Update conversation with last message
      await tx.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: initialMessage.createdAt,
        },
      });

      // Create notification for attorney
      await tx.notification.create({
        data: {
          userId: attorneyId,
          type: "NEW_REQUEST",
          title: "New Consultation Request",
          message: `You have a new ${urgency} priority consultation request from ${session?.user?.name || "a client"}`,
          relatedId: conversation.id,
        },
      });

      return {
        consultationRequest,
        conversation,
        message: initialMessage,
      };
    });

    return NextResponse.json({
      success: true,
      consultationRequest: result.consultationRequest,
      conversation: result.conversation,
      initialMessage: result.message,
      tokenBalance: tokenResult.newBalance,
      message: "Consultation request sent successfully",
    });
  } catch (error) {
    console.error("Error creating consultation request:", error);
    return NextResponse.json(
      { error: "Failed to create consultation request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isClient = session.user.role === "CUSTOMER";
    if (!isClient) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build where clause
    const where: any = {
      clientId: session.user.id,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    // Fetch consultation requests
    const requests = await prisma.consultationRequest.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      requests,
      total: requests.length,
    });
  } catch (error) {
    console.error("Error fetching consultation requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch consultation requests" },
      { status: 500 }
    );
  }
}
