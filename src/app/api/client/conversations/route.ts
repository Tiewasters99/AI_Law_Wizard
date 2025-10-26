import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";

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

    // Fetch conversations for the client
    const conversations = await prisma.conversation.findMany({
      where: {
        clientId: session.user.id,
      },
      include: {
        attorney: {
          select: {
            id: true,
            name: true,
            image: true,
            lawyerProfile: {
              select: {
                practiceAreas: true,
              },
            },
          },
        },
        consultationRequest: {
          select: {
            id: true,
            caseType: true,
            status: true,
            urgency: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    // Format conversations
    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      attorney: conv.attorney,
      consultationRequest: conv.consultationRequest,
      lastMessage: conv.messages[0] || null,
      unreadCount: conv.unreadByClient,
      lastMessageAt: conv.lastMessageAt,
    }));

    return NextResponse.json({
      conversations: formattedConversations,
      total: formattedConversations.length,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch conversations",
        conversations: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
