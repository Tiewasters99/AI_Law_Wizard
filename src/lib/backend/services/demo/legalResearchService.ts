// Service for demo legal research functionality

import { openRouterService } from "../../services/openRouterService";

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

export interface DemoLegalResearchRequest {
  query: string;
  jurisdiction?: string;
  caseType?: string;
}

export interface DemoLegalResearchResponse {
  success: boolean;
  result: string;
  demo: boolean;
  limitations: string[];
}

/**
 * Perform demo legal research
 */
export async function performDemoLegalResearch(
  request: DemoLegalResearchRequest
): Promise<DemoLegalResearchResponse> {
  // Build research query
  const researchQuery = `Research Query: ${request.query}
${request.jurisdiction ? `Jurisdiction: ${request.jurisdiction}` : ""}
${request.caseType ? `Case Type: ${request.caseType}` : ""}

Please provide general legal research guidance for this query. Keep it educational and include appropriate disclaimers.`;

  // Call OpenRouter service
  const response = await openRouterService.chat({
    model: "openai/gpt-4o-mini",
    messages: [{ role: "system", content: DEMO_RESEARCH_PROMPT }],
    max_tokens: 500,
    temperature: 0.3,
  });

  const result =
    response.choices[0]?.message?.content || "No research results generated";

  return {
    success: true,
    result,
    demo: true,
    limitations: [
      "Limited to basic research",
      "No case law database access",
      "No advanced search capabilities",
      "No professional research tools",
    ],
  };
}

