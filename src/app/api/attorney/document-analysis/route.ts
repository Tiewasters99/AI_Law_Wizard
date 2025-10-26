// Attorney Document Analysis API
// Full-featured document processing for licensed attorneys

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

const ATTORNEY_SYSTEM_PROMPT = `You are a professional legal AI assistant for licensed attorneys. Provide comprehensive legal analysis and document processing.

**Your capabilities:**
- Analyze complex legal documents thoroughly
- Provide detailed legal insights and strategic advice
- Answer complex legal questions with citations
- Offer case law analysis and precedent research
- Provide contract analysis and risk assessment
- Draft legal documents and correspondence

**Your approach:**
- Be thorough, accurate, and professional
- Provide detailed explanations with legal citations
- Consider multiple legal perspectives and strategies
- Include relevant case law and statutory references
- Offer practical legal solutions
- Always include appropriate professional disclaimers

Remember: You are providing professional legal assistance to qualified attorneys.`;

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

    // Role check - only attorneys
    const userRole = session.user.role as any;
    if (userRole !== "ATTORNEY" && userRole !== "LAWYER") {
      return NextResponse.json(
        { error: "Attorney access required" },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateLimit = checkRateLimit(
      request,
      session.user.id,
      "ATTORNEY",
      true
    );
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
      analysisContent = `Document: ${fileName}\n\nContent: ${fileContent}\n\nAttorney Request: ${userPrompt}`;
    }

    // Use OpenRouter for professional analysis
    const response = await openRouterService.chat({
      model: openRouterService.getModelForTier("premium"),
      messages: [
        { role: "system", content: ATTORNEY_SYSTEM_PROMPT },
        { role: "user", content: analysisContent },
      ],
      max_tokens: openRouterService.getMaxTokensForTier("premium"),
      temperature: 0.1,
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
          confidence: 0.95,
          processingTime: 0, // Will be calculated in real implementation
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
      // Don't fail the request if database save fails
    }

    const processingResponse: ProcessingResponse = {
      success: true,
      result,
      confidence: 0.95,
      operationChain: [{ operation: "analysis", confidence: 0.95 }],
      totalSteps: 1,
      completedSteps: 1,
      responseMode: "question_answering",
    };

    return NextResponse.json(processingResponse, {
      headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
    });
  } catch (error) {
    console.error("Attorney document analysis error:", error);

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

    // Role check - only attorneys
    const userRole = session.user.role as any;
    if (userRole !== "ATTORNEY" && userRole !== "LAWYER") {
      return NextResponse.json(
        { error: "Attorney access required" },
        { status: 403 }
      );
    }

    // Get query history for the attorney
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
    console.error("Error fetching attorney query history:", error);
    return NextResponse.json(
      { error: "Failed to fetch query history" },
      { status: 500 }
    );
  }
}
