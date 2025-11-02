// Service for client document analysis functionality

import { openRouterService } from "../../openRouterService";
import { createDocumentQuery, findDocumentQueries } from "../../../repositories/attorney/documentQueryRepository";
import type { ProcessingRequest, ProcessingResponse } from "@/types/api";

const CLIENT_SYSTEM_PROMPT = `You are a legal AI assistant for clients. Provide helpful legal information and guidance.

**Your capabilities:**
- Explain legal concepts in simple terms
- Provide general legal guidance
- Answer basic legal questions
- Help understand legal documents
- Provide educational legal information
- Suggest when to consult an attorney

**Your approach:**
- Be clear and easy to understand
- Use plain language, not legal jargon
- Provide practical guidance
- Always recommend consulting with a qualified attorney for specific legal advice
- Include appropriate disclaimers
- Be helpful and supportive

Remember: You are providing general legal information to clients. Always recommend professional legal consultation for specific legal matters.`;

/**
 * Perform document analysis for client
 */
export async function performClientDocumentAnalysis(
  userId: string,
  request: ProcessingRequest
): Promise<ProcessingResponse> {
  // Prepare content for analysis
  let analysisContent = request.userPrompt;
  if (request.fileContent && request.fileName) {
    // Truncate for basic tier (first 4000 characters)
    const truncatedContent = request.fileContent.substring(0, 4000);
    analysisContent = `Document: ${request.fileName}\n\nContent: ${truncatedContent}\n\nClient Question: ${request.userPrompt}`;
  }

  // Use OpenRouter for client analysis
  const response = await openRouterService.chat({
    model: openRouterService.getModelForTier("basic"),
    messages: [
      { role: "system", content: CLIENT_SYSTEM_PROMPT },
      { role: "user", content: analysisContent },
    ],
    max_tokens: openRouterService.getMaxTokensForTier("basic"),
    temperature: 0.3,
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
      confidence: 0.85,
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
  }

  return {
    success: true,
    result,
    confidence: 0.85,
    operationChain: [{ operation: "analysis", confidence: 0.85 }],
    totalSteps: 1,
    completedSteps: 1,
    responseMode: "question_answering",
  };
}

/**
 * Get document analysis history for client
 */
export async function getClientDocumentAnalysisHistory(
  userId: string,
  options: { page?: number; limit?: number; search?: string } = {}
) {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;
  const search = options.search || "";

  const where: any = { userId };
  if (search) {
    where.OR = [
      { userQuery: { contains: search, mode: "insensitive" } },
      { aiResponse: { contains: search, mode: "insensitive" } },
    ];
  }

  const { queries, total } = await findDocumentQueries(where, skip, limit);
  const totalPages = Math.ceil(total / limit);

  return {
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

