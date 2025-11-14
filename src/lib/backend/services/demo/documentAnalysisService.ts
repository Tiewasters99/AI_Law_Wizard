// Service for demo document analysis functionality

import { openRouterService } from "../../services/openRouterService";

const DEMO_ANALYSIS_PROMPT = `You are a demo legal document analysis assistant. Provide helpful but limited document analysis.

**Demo Limitations:**
- Provide general legal analysis only
- Focus on well-known legal concepts
- Do not provide specific legal advice
- Always recommend professional consultation

**Your approach:**
- Match the user's question style: answer simple questions simply, complex questions with detail
- If the user asks a simple question, give a brief, direct answer
- If the user asks for detailed analysis, provide more comprehensive information
- Use markdown formatting appropriately (not for simple questions)
- Keep responses concise and to the point
- Only expand with examples or details when the query warrants it

**Response Guidelines:**
- Simple question → Simple answer (1-2 sentences is fine)
- General question → Brief explanation (1-2 paragraphs max)
- Complex question → Detailed answer with structure
- No unnecessary formatting for simple answers
- Use markdown only when it adds clarity (lists, headers for longer answers)
- Always include disclaimers and encourage professional consultation

Remember: This is a demo version. For comprehensive document analysis, users need to upgrade to a professional account.`;

export interface DemoDocumentAnalysisRequest {
  userIssue: string;
  fileContent?: string;
  fileName?: string;
}

export interface DemoDocumentAnalysisResponse {
  success: boolean;
  result: string;
  demo: boolean;
  limitations: string[];
}

/**
 * Perform demo document analysis
 */
export async function performDemoDocumentAnalysis(
  request: DemoDocumentAnalysisRequest
): Promise<DemoDocumentAnalysisResponse> {
  // Build analysis prompt
  const analysisPrompt = `${DEMO_ANALYSIS_PROMPT}

**Document Information:**
- File: ${request.fileName || "Sample Document"}
- Content Preview: ${request.fileContent || "No content provided"}

**User Request:**
${request.userIssue}

Please provide a demo analysis of this document. Keep it educational and include appropriate disclaimers.`;

  // Call OpenRouter service
  const response = await openRouterService.chat({
    model: "openai/gpt-4o-mini",
    messages: [{ role: "system", content: analysisPrompt }],
    max_tokens: 500,
    temperature: 0.3,
  });

  const result =
    response.choices[0]?.message?.content || "No analysis generated";

  return {
    success: true,
    result,
    demo: true,
    limitations: [
      "Limited to basic analysis",
      "No file upload capabilities",
      "No vector search",
      "No advanced AI features",
    ],
  };
}

