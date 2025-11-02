// Service for guest legal research functionality

import { openRouterService } from "../../services/openRouterService";
import { DemoProcessingResponse } from "@/types/api";

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

export interface GuestLegalResearchRequest {
  query: string;
  jurisdiction?: string;
  caseType?: string;
}

/**
 * Perform guest legal research with rate limiting considerations
 */
export async function performGuestLegalResearch(
  request: GuestLegalResearchRequest
): Promise<DemoProcessingResponse> {
  // Build research query
  const researchQuery = `Research Query: ${request.query}
${request.jurisdiction ? `Jurisdiction: ${request.jurisdiction}` : ""}
${request.caseType ? `Case Type: ${request.caseType}` : ""}

Please provide general legal research guidance for this query.`;

  // Use OpenRouter for demo research
  const response = await openRouterService.chat({
    model: openRouterService.getModelForTier("demo"),
    messages: [
      { role: "system", content: DEMO_RESEARCH_PROMPT },
      { role: "user", content: researchQuery },
    ],
    max_tokens: openRouterService.getMaxTokensForTier("demo"),
    temperature: 0.3,
  });

  const result =
    response.choices[0]?.message?.content || "No research results generated";

  if (!result || result.trim() === "") {
    throw new Error("Empty response from AI model");
  }

  return {
    success: true,
    result,
    isDemo: true,
    limitations: [
      "Limited to general legal concepts",
      "No case law database access",
      "No statute research",
      "Basic research guidance only",
    ],
    upgradeMessage:
      "Upgrade to access comprehensive legal databases, case law research, and advanced search capabilities",
  };
}

