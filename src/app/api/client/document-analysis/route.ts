// Client Document Analysis API
// Basic document processing for clients

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  authOptions,
  checkRateLimit,
  getRateLimitHeaders,
  openRouterService,
  prisma,
} from "@/lib/backend";
import { ProcessingRequest, ProcessingResponse } from "@/types/api";

const CLIENT_SYSTEM_PROMPT = `You are a legal AI assistant for clients. Provide helpful legal information and guidance.

**Your capabilities:**
- Explain legal concepts in simple terms
- Provide general legal guidance
- Answer basic legal questions
- Help understand legal documents
- Provide educational legal information
- Suggest when to consult an attorney

**Your approach:**
- Be clear and easy to understand
- Use plain language, not legal jargon
- Provide practical guidance
- Always recommend consulting with a qualified attorney for specific legal advice
- Include appropriate disclaimers
- Be helpful and supportive

Remember: You are providing general legal information to clients. Always recommend professional legal consultation for specific legal matters.`;

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Role check - only clients
    const userRole = session.user.role as any;
    if (userRole !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Client access required" },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateLimit = checkRateLimit(request, session.user.id, "CLIENT", true);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    const body: ProcessingRequest = await request.json();
    const { userPrompt, searchQuery, fileContent, fileName } = body;

    if (!userPrompt) {
      return NextResponse.json(
        { error: "User prompt is required" },
        { status: 400 }
      );
    }

    // Prepare content for analysis
    let analysisContent = userPrompt;
    if (fileContent && fileName) {
      // Truncate for basic tier (first 4000 characters)
      const truncatedContent = fileContent.substring(0, 4000);
      analysisContent = `Document: ${fileName}\n\nContent: ${truncatedContent}\n\nClient Question: ${userPrompt}`;
    }

    // Use OpenRouter for client analysis
    const response = await openRouterService.chat({
      model: openRouterService.getModelForTier("basic"),
      messages: [
        { role: "system", content: CLIENT_SYSTEM_PROMPT },
        { role: "user", content: analysisContent },
      ],
      max_tokens: openRouterService.getMaxTokensForTier("basic"),
      temperature: 0.3,
    });

    const result =
      response.choices[0]?.message?.content || "No response generated";

    // Save to database
    try {
      await prisma.documentQuery.create({
        data: {
          userQuery: userPrompt,
          aiResponse: result,
          searchQuery: searchQuery,
          success: true,
          confidence: 0.85,
          processingTime: 0,
          totalSteps: 1,
          completedSteps: 1,
          toolsUsed: ["openrouter_ai"],
          filesProcessed: fileName
            ? [{ fileName, fileSize: fileContent?.length || 0 }]
            : undefined,
        },
      });
    } catch (dbError) {
      console.error("Failed to save query to database:", dbError);
    }

    const processingResponse: ProcessingResponse = {
      success: true,
      result,
      confidence: 0.85,
      operationChain: [{ operation: "analysis", confidence: 0.85 }],
      totalSteps: 1,
      completedSteps: 1,
      responseMode: "question_answering",
    };

    return NextResponse.json(processingResponse, {
      headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
    });
  } catch (error) {
    console.error("Client document analysis error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Document analysis failed",
      } as ProcessingResponse,
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Role check - only clients
    const userRole = session.user.role as any;
    if (userRole !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Client access required" },
        { status: 403 }
      );
    }

    // Get query history for the client
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { userQuery: { contains: search, mode: "insensitive" } },
        { aiResponse: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.documentQuery.count({ where });

    // Fetch queries
    const queries = await prisma.documentQuery.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        userQuery: true,
        aiResponse: true,
        searchQuery: true,
        success: true,
        confidence: true,
        processingTime: true,
        totalSteps: true,
        completedSteps: true,
        toolsUsed: true,
        filesProcessed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        queries,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching client query history:", error);
    return NextResponse.json(
      { error: "Failed to fetch query history" },
      { status: 500 }
    );
  }
}
