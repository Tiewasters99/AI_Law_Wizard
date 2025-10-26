// Attorney Legal Research API
// Comprehensive legal research for licensed attorneys

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  authOptions,
  checkRateLimit,
  getRateLimitHeaders,
  openRouterService,
  prisma,
} from "@/lib/backend";

const ATTORNEY_RESEARCH_PROMPT = `You are a professional legal research assistant for licensed attorneys. Provide comprehensive legal research and analysis.

**Your capabilities:**
- Comprehensive case law research and analysis
- Statutory interpretation and analysis
- Legal precedent identification and analysis
- Jurisdiction-specific legal guidance
- Legal strategy development and recommendations
- Citation formatting and legal writing assistance

**Your approach:**
- Provide detailed legal research with proper citations
- Include relevant case law, statutes, and regulations
- Analyze legal precedents and their applicability
- Consider jurisdictional differences and nuances
- Offer strategic legal recommendations
- Include practical implementation guidance

**Response Format:**
- Use markdown formatting for clear structure
- Use headers to organize different sections
- Include bullet points and numbered lists
- Format citations properly
- Use tables for comparative analysis when appropriate
- Include relevant legal disclaimers

Remember: You are providing professional legal research assistance to qualified attorneys.`;

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

    const body = await request.json();
    const { query, jurisdiction, caseType, practiceArea } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Research query is required" },
        { status: 400 }
      );
    }

    // Prepare comprehensive research query
    const researchQuery = `Legal Research Request:
Query: ${query}
${jurisdiction ? `Jurisdiction: ${jurisdiction}` : ""}
${caseType ? `Case Type: ${caseType}` : ""}
${practiceArea ? `Practice Area: ${practiceArea}` : ""}

Please provide comprehensive legal research for this query, including relevant case law, statutes, and strategic recommendations.`;

    // Use OpenRouter for professional research
    const response = await openRouterService.chat({
      model: openRouterService.getModelForTier("premium"),
      messages: [
        { role: "system", content: ATTORNEY_RESEARCH_PROMPT },
        { role: "user", content: researchQuery },
      ],
      max_tokens: openRouterService.getMaxTokensForTier("premium"),
      temperature: 0.1,
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
          confidence: 0.95,
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
        confidence: 0.95,
        researchType: "comprehensive",
        jurisdiction: jurisdiction || "general",
        practiceArea: practiceArea || "general",
      },
      {
        headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
      }
    );
  } catch (error) {
    console.error("Attorney legal research error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Legal research failed",
      },
      { status: 500 }
    );
  }
}
