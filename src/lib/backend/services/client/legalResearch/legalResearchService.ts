// Service for client legal research functionality

import { openRouterService } from "../../openRouterService";
import { createDocumentQuery } from "../../../repositories/attorney/documentQueryRepository";

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

export interface LegalResearchRequest {
  query: string;
  jurisdiction?: string;
  caseType?: string;
}

/**
 * Perform legal research for client
 */
export async function performClientLegalResearch(
  userId: string,
  request: LegalResearchRequest
) {
  if (!request.query) {
    throw new Error("Research query is required");
  }

  // Prepare research query
  const researchQuery = `Research Query: ${request.query}
${request.jurisdiction ? `Jurisdiction: ${request.jurisdiction}` : ""}
${request.caseType ? `Case Type: ${request.caseType}` : ""}

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

  // Save to database (non-blocking)
  try {
    await createDocumentQuery({
      userQuery: request.query,
      aiResponse: result,
      searchQuery: `Research: ${request.query}`,
      success: true,
      confidence: 0.85,
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
    confidence: 0.85,
    researchType: "basic",
    jurisdiction: request.jurisdiction || "general",
    practiceArea: request.caseType || "general",
  };
}

