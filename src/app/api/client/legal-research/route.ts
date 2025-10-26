// Client Legal Research API
// Basic legal research for clients

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  authOptions,
  checkRateLimit,
  getRateLimitHeaders,
  openRouterService,
  prisma,
} from "@/lib/backend";

const CLIENT_RESEARCH_PROMPT = `You are a legal research assistant for clients. Provide helpful legal research and guidance.

**Your capabilities:**
- Explain legal concepts clearly
- Provide general research guidance
- Answer basic legal questions
- Help understand legal documents
- Suggest where to find more information
- Always recommend professional legal consultation

**Your approach:**
- Be clear and easy to understand
- Use plain language, not legal jargon
- Provide practical guidance
- Always include disclaimers
- Encourage professional consultation

**Response Format:**
- Use markdown formatting for clear structure
- Use headers to organize information
- Include bullet points for key information
- Use simple language and clear explanations
- Include relevant legal disclaimers
- End with recommendations for professional consultation

Remember: You are providing general legal research assistance to clients. Always recommend professional legal consultation for specific legal matters.`;

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

    const body = await request.json();
    const { query, jurisdiction, caseType } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Research query is required" },
        { status: 400 }
      );
    }

    // Prepare research query
    const researchQuery = `Research Query: ${query}
${jurisdiction ? `Jurisdiction: ${jurisdiction}` : ""}
${caseType ? `Case Type: ${caseType}` : ""}

Please provide general legal research guidance for this query.`;

    // Use OpenRouter for client research
    const response = await openRouterService.chat({
      model: openRouterService.getModelForTier("basic"),
      messages: [
        { role: "system", content: CLIENT_RESEARCH_PROMPT },
        { role: "user", content: researchQuery },
      ],
      max_tokens: openRouterService.getMaxTokensForTier("basic"),
      temperature: 0.3,
    });

    const result =
      response.choices[0]?.message?.content || "No research results generated";

    // Save to database
    try {
      await prisma.documentQuery.create({
        data: {
          userQuery: query,
          aiResponse: result,
          searchQuery: `Research: ${query}`,
          success: true,
          confidence: 0.85,
          processingTime: 0,
          totalSteps: 1,
          completedSteps: 1,
          toolsUsed: ["openrouter_ai"],
          filesProcessed: undefined,
        },
      });
    } catch (dbError) {
      console.error("Failed to save research to database:", dbError);
    }

    return NextResponse.json(
      {
        success: true,
        result,
        confidence: 0.85,
        researchType: "basic",
        jurisdiction: jurisdiction || "general",
        practiceArea: caseType || "general",
      },
      {
        headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
      }
    );
  } catch (error) {
    console.error("Client legal research error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Legal research failed",
      },
      { status: 500 }
    );
  }
}
