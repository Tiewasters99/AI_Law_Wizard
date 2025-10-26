import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";
import { openRouterService } from "@/lib/backend/services/openRouterService";

interface ProcessingRequest {
  userPrompt: string;
  files?: string[];
}

interface ProcessingResponse {
  success: boolean;
  result?: string;
  error?: string;
  processedFiles?: any[];
  queryId?: string;
}

// Fast response mode detection using simple keyword matching
const detectResponseMode = (
  userPrompt: string
): "question_answering" | "action_performance" => {
  const lowerPrompt = userPrompt.toLowerCase();

  const questionKeywords = [
    "what",
    "how",
    "why",
    "when",
    "where",
    "who",
    "which",
    "explain",
    "describe",
    "summarize",
    "summary",
    "analyze",
    "analysis",
    "extract",
    "key points",
    "main points",
    "overview",
    "highlights",
    "tell me",
    "show me",
    "find",
    "search",
    "what is in",
  ];

  const actionKeywords = [
    "edit",
    "modify",
    "change",
    "update",
    "create",
    "write",
    "add",
    "remove",
    "delete",
    "insert",
    "rewrite",
    "generate",
    "draft",
    "fill",
    "populate",
  ];

  const questionScore = questionKeywords.reduce((score, keyword) => {
    return score + (lowerPrompt.includes(keyword) ? 1 : 0);
  }, 0);

  const actionScore = actionKeywords.reduce((score, keyword) => {
    return score + (lowerPrompt.includes(keyword) ? 1 : 0);
  }, 0);

  return questionScore > 0 && questionScore >= actionScore
    ? "question_answering"
    : "action_performance";
};

// Process documents based on user prompt
const processDocuments = async (
  request: ProcessingRequest,
  userId: string
): Promise<ProcessingResponse> => {
  const startTime = Date.now();

  try {
    console.log("🚀 Starting document processing");

    // Detect response mode
    const responseMode = detectResponseMode(request.userPrompt);
    console.log(`📋 Detected mode: ${responseMode}`);

    const systemPrompt =
      responseMode === "question_answering"
        ? "You are a legal AI assistant. Analyze documents and answer questions accurately."
        : "You are a legal AI assistant. Help users create, edit, and modify legal documents.";

    const userPrompt = `User Request: ${request.userPrompt}`;

    // Use OpenRouter to process the request
    const response = await openRouterService.chat({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const result = response.choices[0].message.content;

    // Save to database
    const processingTime = Date.now() - startTime;
    const savedQuery = await prisma.documentQuery.create({
      data: {
        userId,
        userQuery: request.userPrompt,
        aiResponse: result,
        searchQuery: request.userPrompt,
        success: true,
        confidence: 0.9,
        processingTime,
        totalSteps: 2,
        completedSteps: 2,
        toolsUsed: ["openrouter_ai"],
        filesProcessed: [],
      },
    });

    console.log(`✅ Processing complete in ${processingTime}ms`);

    return {
      success: true,
      result,
      queryId: savedQuery.id,
    };
  } catch (error) {
    console.error("❌ Processing failed:", error);

    // Save failed query
    const processingTime = Date.now() - startTime;
    try {
      await prisma.documentQuery.create({
        data: {
          userId,
          userQuery: request.userPrompt,
          aiResponse: "",
          searchQuery: request.userPrompt,
          success: false,
          error: String(error),
          processingTime,
          totalSteps: 1,
          completedSteps: 0,
          toolsUsed: [],
          filesProcessed: [],
        },
      });
    } catch (dbError) {
      console.error("❌ Failed to save error to database:", dbError);
    }

    return {
      success: false,
      error: `Processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is an attorney (ATTORNEY or legacy LAWYER role)
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

    const { userPrompt, files } = await request.json();

    if (!userPrompt) {
      return NextResponse.json(
        { error: "Missing user prompt" },
        { status: 400 }
      );
    }

    // Process documents
    const result = await processDocuments(
      { userPrompt, files },
      session.user.id
    );

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during document processing",
      },
      { status: 500 }
    );
  }
}
