// Service for attorney document analysis functionality

import { openRouterService } from "../../openRouterService";
import {
  createDocumentQuery,
  findDocumentQueries,
} from "../../../repositories/attorney/documentQueryRepository";
import { findUserById } from "../../../repositories/common/userRepository";
import { getUserNamespace } from "../../../config/pineconeConfig";
import {
  findCompletedEmbeddingJobsByUserId,
  findEmbeddingChunksByJobId,
  findEmbeddingJobByIdAndUserId,
} from "../../../repositories/attorney/embeddingJobRepository";
import {
  formatQueryResultsForSources,
  queryPineconeNamespace,
} from "../../../utils/pineconeQuery";
import { deductTokens } from "../../../tokenService";
import { getFeatureTokenCost } from "../../pricing/featurePricingService";
import type { ProcessingRequest, ProcessingResponse } from "@/types/api";
import { MessageRole, JobStatus } from "@prisma/client";
import { ValidationError } from "../../../utils/errors";

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
 * Perform RAG query for attorneys using Pinecone
 */
async function performRAGQuery(
  userId: string,
  userPrompt: string,
  fileFilter?: string
): Promise<{
  result: string;
  sources: Array<{
    fileId: string;
    fileName: string;
    chunkIndex: number;
    text: string;
    score: number;
  }>;
}> {
  const user = await findUserById(userId);
  if (!user) {
    throw new ValidationError("User not found");
  }
  const namespace = getUserNamespace(userId, user.email);

  // Build file name map from completed jobs
  const completedJobs = await findCompletedEmbeddingJobsByUserId(userId);
  const fileNameMap = new Map<string, string>();
  completedJobs.forEach(job => {
    if (job.fileName) {
      fileNameMap.set(job.fileName, job.originalName || job.fileName);
    }
  });

  // Generate query embedding
  const queryEmbedding = await openRouterService.generateEmbedding(userPrompt);

  // Query Pinecone
  const queryResults = await queryPineconeNamespace(namespace, queryEmbedding, {
    topK: 10,
    includeMetadata: true,
    fileFilter,
  });

  if (queryResults.length === 0) {
    return {
      result:
        "No relevant excerpts were found in your documents. Try refining your request or ensure your documents are processed.",
      sources: [],
    };
  }

  const sources = formatQueryResultsForSources(queryResults, fileNameMap);

  // Build enhanced prompt
  const context = queryResults
    .map((r, idx) => {
      const text = r.metadata.text || "";
      const fileId = r.metadata.fileId || "";
      const fileName =
        fileNameMap.get(fileId) || fileId.split("/").pop() || "Unknown";
      return `[Document: ${fileName}, Chunk ${idx + 1}]:\n${text}`;
    })
    .join("\n\n---\n\n");

  const enhancedPrompt = `Using the following excerpts from the attorney's documents, provide a precise, citation-rich answer.

Relevant Excerpts:
${context}

Attorney Request: ${userPrompt}

Answer with professional legal rigor. If documents don't contain enough data, state limitations clearly.`;

  const response = await openRouterService.chat({
    model: openRouterService.getModelForTier("premium"),
    messages: [
      { role: "system", content: ATTORNEY_SYSTEM_PROMPT },
      { role: "user", content: enhancedPrompt },
    ],
    max_tokens: openRouterService.getMaxTokensForTier("premium"),
    temperature: 0.1,
  });

  const result =
    response.choices[0]?.message?.content || "No response generated";
  return { result, sources };
}

/**
 * Perform document analysis
 */
export async function performDocumentAnalysis(
  userId: string,
  request: ProcessingRequest
): Promise<ProcessingResponse> {
  let result: string;
  let sources: Array<{
    fileId: string;
    fileName: string;
    chunkIndex: number;
    text: string;
    score: number;
  }> = [];

  // If queryAllDocuments, perform RAG across all completed documents
  if ((request as any).queryAllDocuments) {
    const rag = await performRAGQuery(userId, request.userPrompt);
    result = rag.result;
    sources = rag.sources;
  }
  // If a specific documentId is provided, attempt targeted RAG or direct content analysis
  else if ((request as any).documentId) {
    const job = await findEmbeddingJobByIdAndUserId(
      (request as any).documentId,
      userId
    );
    if (!job) {
      throw new ValidationError("Document not found");
    }

    // If chunks exist and document is completed, try direct content for small docs
    if (job.status === JobStatus.COMPLETED) {
      const chunks = await findEmbeddingChunksByJobId(job.id);
      const ordered = chunks
        .filter(c => c.status === "COMPLETED")
        .sort((a, b) => a.chunkIndex - b.chunkIndex);

      const fullContent = ordered.map(c => c.content).join("\n\n");
      if (fullContent && fullContent.length < 15000) {
        const truncated = fullContent.substring(0, 12000);
        const analysisContent = `Document: ${job.originalName || job.fileName}\n\nContent: ${truncated}\n\nAttorney Request: ${request.userPrompt}`;

        const response = await openRouterService.chat({
          model: openRouterService.getModelForTier("premium"),
          messages: [
            { role: "system", content: ATTORNEY_SYSTEM_PROMPT },
            { role: "user", content: analysisContent },
          ],
          max_tokens: openRouterService.getMaxTokensForTier("premium"),
          temperature: 0.1,
        });

        result =
          response.choices[0]?.message?.content || "No response generated";
        sources = [
          {
            fileId: job.fileName,
            fileName: job.originalName || job.fileName,
            chunkIndex: 0,
            text: truncated.substring(0, 500),
            score: 1.0,
          },
        ];
      } else {
        // Use RAG restricted to this file
        const rag = await performRAGQuery(
          userId,
          request.userPrompt,
          job.fileName
        );
        result = rag.result;
        sources = rag.sources;
      }
    } else {
      // Not completed yet; do RAG (it may return empty if no vectors)
      const rag = await performRAGQuery(
        userId,
        request.userPrompt,
        job.fileName
      );
      result = rag.result;
      sources = rag.sources;
    }
  }
  // Fallback: no document flags; just do plain premium analysis
  else {
    let analysisContent = request.userPrompt;
    if (request.fileContent && request.fileName) {
      analysisContent = `Document: ${request.fileName}\n\nContent: ${request.fileContent}\n\nAttorney Request: ${request.userPrompt}`;
    }

    const response = await openRouterService.chat({
      model: openRouterService.getModelForTier("premium"),
      messages: [
        { role: "system", content: ATTORNEY_SYSTEM_PROMPT },
        { role: "user", content: analysisContent },
      ],
      max_tokens: openRouterService.getMaxTokensForTier("premium"),
      temperature: 0.1,
    });

    result = response.choices[0]?.message?.content || "No response generated";
  }

  // Save to database (non-blocking)
  try {
    await createDocumentQuery({
      userQuery: request.userPrompt,
      aiResponse: result,
      searchQuery: request.searchQuery || null,
      success: true,
      confidence: sources.length > 0 ? 0.92 : 0.95,
      processingTime: 0,
      totalSteps: 1,
      completedSteps: 1,
      toolsUsed:
        sources.length > 0 ? ["rag", "openrouter_ai"] : ["openrouter_ai"],
      filesProcessed:
        sources.length > 0
          ? sources.map(s => ({
              fileName: s.fileName,
              chunkCount: s.chunkIndex === -1 ? 0 : 1,
            }))
          : request.fileName
            ? [
                {
                  fileName: request.fileName,
                  fileSize: request.fileContent?.length || 0,
                },
              ]
            : undefined,
      userId,
    });
  } catch (dbError) {
    console.error("Failed to save query to database:", dbError);
    // Don't fail the request if database save fails
  }

  // Track token usage for attorneys (track only, don't deduct from balance)
  // Get token cost from database
  let tokenCost: number;
  try {
    tokenCost = await getFeatureTokenCost("wizard", "ATTORNEY");
  } catch (pricingError) {
    // Fallback to default if pricing not found
    console.error(
      'Failed to get pricing for feature "wizard" (ATTORNEY):',
      pricingError
    );
    tokenCost = 5;
  }

  try {
    await deductTokens(
      userId,
      tokenCost,
      sources.length > 0
        ? "Document Analysis (Attorney, RAG)"
        : "Document Analysis (Attorney)",
      "wizard",
      {
        operation:
          sources.length > 0 ? "document_analysis_rag" : "document_analysis",
        fileName: (request as any).documentId || request.fileName,
      },
      true // trackOnly = true for attorneys
    );
  } catch (tokenError) {
    console.error("Failed to track token usage:", tokenError);
    // Don't fail the request if token tracking fails
  }

  return {
    success: true,
    result,
    confidence: sources.length > 0 ? 0.92 : 0.95,
    operationChain: [
      {
        operation: "analysis",
        confidence: sources.length > 0 ? 0.92 : 0.95,
      },
    ],
    totalSteps: 1,
    completedSteps: 1,
    responseMode: "question_answering",
    sources,
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
