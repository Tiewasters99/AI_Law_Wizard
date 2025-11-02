// Service for attorney document analysis functionality

import { openRouterService } from "../../openRouterService";
import { createDocumentQuery, findDocumentQueries } from "../../../repositories/attorney/documentQueryRepository";
import type { ProcessingRequest, ProcessingResponse } from "@/types/api";

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

/**
 * Perform document analysis
 */
export async function performDocumentAnalysis(
  userId: string,
  request: ProcessingRequest
): Promise<ProcessingResponse> {
  // Prepare content for analysis
  let analysisContent = request.userPrompt;
  if (request.fileContent && request.fileName) {
    analysisContent = `Document: ${request.fileName}\n\nContent: ${request.fileContent}\n\nAttorney Request: ${request.userPrompt}`;
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

  // Save to database (non-blocking)
  try {
    await createDocumentQuery({
      userQuery: request.userPrompt,
      aiResponse: result,
      searchQuery: request.searchQuery || null,
      success: true,
      confidence: 0.95,
      processingTime: 0,
      totalSteps: 1,
      completedSteps: 1,
      toolsUsed: ["openrouter_ai"],
      filesProcessed: request.fileName
        ? [{ fileName: request.fileName, fileSize: request.fileContent?.length || 0 }]
        : undefined,
      userId,
    });
  } catch (dbError) {
    console.error("Failed to save query to database:", dbError);
    // Don't fail the request if database save fails
  }

  return {
    success: true,
    result,
    confidence: 0.95,
    operationChain: [{ operation: "analysis", confidence: 0.95 }],
    totalSteps: 1,
    completedSteps: 1,
    responseMode: "question_answering",
  };
}

/**
 * Get document analysis history with pagination
 */
export async function getDocumentAnalysisHistory(
  page: number = 1,
  limit: number = 20,
  search?: string
) {
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};
  if (search) {
    where.OR = [
      { userQuery: { contains: search, mode: "insensitive" } },
      { aiResponse: { contains: search, mode: "insensitive" } },
    ];
  }

  const { queries, total } = await findDocumentQueries(where, skip, limit);
  const totalPages = Math.ceil(total / limit);

  return {
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
  };
}

