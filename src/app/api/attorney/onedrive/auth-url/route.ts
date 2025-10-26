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

    // Check if user is an attorney
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAttorney = currentUser.role === "ATTORNEY";

    if (!isAttorney) {
      return NextResponse.json(
        { error: "Access denied. Attorney access required." },
        { status: 403 }
      );
    }

    const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
    const redirectUri =
      process.env.NEXT_PUBLIC_REDIRECT_URI ||
      "http://localhost:3000/api/auth/onedrive/callback";
    const scope =
      "https://graph.microsoft.com/Files.ReadWrite.All https://graph.microsoft.com/User.Read";

    if (!clientId) {
      return NextResponse.json(
        { error: "Azure Client ID not configured" },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: scope,
      response_mode: "query",
    });

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    console.error("OneDrive auth URL error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate auth URL",
      },
      { status: 500 }
    );
  }
}
