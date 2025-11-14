// Service for attorney legal research functionality

import { openRouterService } from "../../openRouterService";
import { createDocumentQuery } from "../../../repositories/attorney/documentQueryRepository";

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

export interface LegalResearchRequest {
  query: string;
  jurisdiction?: string;
  caseType?: string;
  practiceArea?: string;
}

export interface LegalResearchResponse {
  success: boolean;
  result: string;
  confidence: number;
  researchType: string;
  jurisdiction: string;
  practiceArea: string;
}

/**
 * Perform legal research
 */
export async function performLegalResearch(
  userId: string,
  request: LegalResearchRequest
): Promise<LegalResearchResponse> {
  // Prepare comprehensive research query
  const researchQuery = `Legal Research Request:
Query: ${request.query}
${request.jurisdiction ? `Jurisdiction: ${request.jurisdiction}` : ""}
${request.caseType ? `Case Type: ${request.caseType}` : ""}
${request.practiceArea ? `Practice Area: ${request.practiceArea}` : ""}

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

  // Save to database (non-blocking)
  try {
    await createDocumentQuery({
      userQuery: request.query,
      aiResponse: result,
      searchQuery: `Research: ${request.query}`,
      success: true,
      confidence: 0.95,
      processingTime: 0,
      totalSteps: 1,
      completedSteps: 1,
      toolsUsed: ["openrouter_ai"],
      filesProcessed: undefined,
      userId,
    });
  } catch (dbError) {
    console.error("Failed to save research to database:", dbError);
  }

  return {
    success: true,
    result,
    confidence: 0.95,
    researchType: "comprehensive",
    jurisdiction: request.jurisdiction || "general",
    practiceArea: request.practiceArea || "general",
  };
}

