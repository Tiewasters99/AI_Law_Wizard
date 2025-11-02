import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/backend/prisma";

interface SessionRequest {
  userPrompt: string;
  processedFiles: any[];
  analysisResult: string;
}

interface SessionResponse {
  success: boolean;
  sessionId?: string;
  session?: any;
  sessions?: any[];
  error?: string;
}

// Create a new session
export const POST = async (
  request: NextRequest
): Promise<NextResponse<SessionResponse>> => {
  try {
    const body: SessionRequest = await request.json();
    const { userPrompt, processedFiles, analysisResult } = body;

    if (!userPrompt || !analysisResult) {
      return NextResponse.json(
        {
          success: false,
          error: "User prompt and analysis result are required",
        },
        { status: 400 }
      );
    }

    // Create session in database
    const session = await prisma.chatSession.create({
      data: {
        metadata: {
          userPrompt,
          processedFiles: processedFiles || [],
          analysisResult,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      session: {
        id: session.id,
        userPrompt,
        processedFiles: processedFiles || [],
        analysisResult,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Create session API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while creating session",
      },
      { status: 500 }
    );
  }
};

// Get all sessions or specific session
export const GET = async (
  request: NextRequest
): Promise<NextResponse<SessionResponse>> => {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      // Get specific session
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return NextResponse.json(
          {
            success: false,
            error: "Session not found",
          },
          { status: 404 }
        );
      }

      const context = session.metadata as any;

      return NextResponse.json({
        success: true,
        session: {
          sessionId: session.id,
          userPrompt: context?.userPrompt || "",
          processedFiles: context?.processedFiles || [],
          analysisResult: context?.analysisResult || "",
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        },
      });
    } else {
      // List all sessions
      const sessions = await prisma.chatSession.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const formattedSessions = sessions.map(
        (session: {
          id: string;
          metadata?: unknown;
          createdAt: Date;
          updatedAt: Date;
        }) => {
          const context =
            session.metadata && typeof session.metadata === "string"
              ? (() => {
                  try {
                    return JSON.parse(session.metadata as string);
                  } catch {
                    return {};
                  }
                })()
              : session.metadata || {};
          return {
            sessionId: session.id,
            userPrompt: (context as Record<string, unknown>)?.userPrompt || "",
            processedFiles: context?.processedFiles || [],
            analysisResult: context?.analysisResult || "",
            createdAt: session.createdAt.toISOString(),
            updatedAt: session.updatedAt.toISOString(),
          };
        }
      );

      return NextResponse.json({
        success: true,
        sessions: formattedSessions,
      });
    }
  } catch (error) {
    console.error("❌ Get session API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while retrieving session(s)",
      },
      { status: 500 }
    );
  }
};

// Update session
export const PUT = async (
  request: NextRequest
): Promise<NextResponse<SessionResponse>> => {
  try {
    const body = await request.json();
    const { sessionId, ...updates } = body;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Session ID is required",
        },
        { status: 400 }
      );
    }

    // Update session
    const session = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        metadata: updates,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("❌ Update session API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while updating session",
      },
      { status: 500 }
    );
  }
};

// Delete session
export const DELETE = async (
  request: NextRequest
): Promise<NextResponse<SessionResponse>> => {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Session ID is required",
        },
        { status: 400 }
      );
    }

    // Delete session
    await prisma.chatSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("❌ Delete session API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while deleting session",
      },
      { status: 500 }
    );
  }
};
