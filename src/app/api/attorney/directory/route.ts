import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user's role from the database
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify this is an attorney
    const isAttorney = currentUser.role === "ATTORNEY";
    if (!isAttorney) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch consultation requests for this attorney
    const consultationRequests = await prisma.consultationRequest.findMany({
      where: {
        attorneyId: session.user.id,
      },
      select: {
        clientId: true,
        status: true,
        id: true,
        caseType: true,
        urgency: true,
        createdAt: true,
        conversation: {
          select: {
            id: true,
            unreadByAttorney: true,
          },
        },
      },
    });

    // Get unique client IDs
    const clientIds = [
      ...new Set(consultationRequests.map(req => req.clientId)),
    ];

    // Fetch client details
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: clientIds,
        },
        role: "CUSTOMER",
        profileComplete: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        profileData: true,
        createdAt: true,
        customerProfile: {
          select: {
            companyName: true,
            address: true,
            phone: true,
            industry: true,
            needs: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Attach consultation request info to each user
    const usersWithRequests = users.map(user => {
      const userRequests = consultationRequests.filter(
        req => req.clientId === user.id
      );
      return {
        ...user,
        consultationRequests: userRequests,
      };
    });

    return NextResponse.json({
      users: usersWithRequests,
      currentUserRole: currentUser.role,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching directory users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users", success: false },
      { status: 500 }
    );
  }
}
