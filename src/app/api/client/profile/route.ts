import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile with related data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        wallet: true,
        tokenTransactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            clientConsultationRequests: true,
            clientConversations: true,
            chatSessions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate token statistics
    const totalPurchased = await prisma.tokenTransaction.aggregate({
      where: {
        userId: user.id,
        type: "PURCHASE",
      },
      _sum: {
        amount: true,
      },
    });

    const totalConsumed = await prisma.tokenTransaction.aggregate({
      where: {
        userId: user.id,
        type: "CONSUMPTION",
      },
      _sum: {
        amount: true,
      },
    });

    const tokensUsed = Math.abs(totalConsumed._sum?.amount || 0);
    const tokensRemaining = user.wallet?.balance || 0;

    // Format profile data
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      company: user.company,
      industry: user.industry,
      location: user.location,
      bio: user.bio,
      avatar: user.image,
      joinDate: user.createdAt,
      lastActive: user.updatedAt,
      preferences: {
        notifications: true, // These would come from a preferences table
        emailUpdates: true,
        smsUpdates: false,
      },
      statistics: {
        totalQueries: user._count.chatSessions,
        totalDocuments: user._count.chatSessions, // Assuming each chat session involves documents
        totalConsultations: user._count.clientConsultationRequests,
        tokensUsed,
        tokensRemaining,
      },
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, company, industry, location, bio } = body;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        company,
        industry,
        location,
        bio,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        company: updatedUser.company,
        industry: updatedUser.industry,
        location: updatedUser.location,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
