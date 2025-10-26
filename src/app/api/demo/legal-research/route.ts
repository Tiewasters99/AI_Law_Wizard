// Demo Legal Research API
// Limited functionality for guest users to try attorney features

import { NextRequest, NextResponse } from "next/server";
import { openRouterService } from "@/lib/backend";

const DEMO_RESEARCH_PROMPT = `You are a demo legal research assistant. Provide helpful but limited legal research information.

**Demo Limitations:**
- Provide general legal information only
- Focus on well-known legal concepts
- Do not provide specific case law citations
- Always recommend professional legal research

**Your approach:**
- Match the user's question style: answer simple questions simply, complex questions with detail
- If the user asks a simple question, give a brief, direct answer
- If the user asks for detailed research, provide more comprehensive information
- Use markdown formatting appropriately (not for simple questions)
- Keep responses concise and to the point
- Only expand with examples or details when the query warrants it

**Response Guidelines:**
- Simple question → Simple answer (1-2 sentences is fine)
- General question → Brief explanation (1-2 paragraphs max)
- Complex question → Detailed answer with structure
- No unnecessary formatting for simple answers
- Use markdown only when it adds clarity (lists, headers for longer answers)
- Always include a brief disclaimer

Remember: This is a demo version. For comprehensive legal research, users need to upgrade to a professional account.`;

export async function POST(request: NextRequest) {
  try {
    const { query, jurisdiction, caseType } = await request.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Research query is required" },
        { status: 400 }
      );
    }

    // Create demo research prompt
    const researchPrompt = `${DEMO_RESEARCH_PROMPT}

**Research Query:**
${query}

${jurisdiction ? `Jurisdiction: ${jurisdiction}` : ""}
${caseType ? `Case Type: ${caseType}` : ""}

Please provide general legal research guidance for this query. Keep it educational and include appropriate disclaimers.`;

    // Use OpenRouter for demo research
    const response = await openRouterService.chat({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "system", content: researchPrompt }],
      max_tokens: 500,
      temperature: 0.3,
    });

    const result =
      response.choices[0]?.message?.content || "No research results generated";

    return NextResponse.json({
      success: true,
      result: result,
      demo: true,
      limitations: [
        "Limited to basic research",
        "No case law database access",
        "No advanced search capabilities",
        "No professional research tools",
      ],
    });
  } catch (error) {
    console.error("Demo Legal Research API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Demo research failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
