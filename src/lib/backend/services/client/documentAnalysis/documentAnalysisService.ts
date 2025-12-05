// Service for client document analysis functionality

import { openRouterService } from "../../openRouterService";
import {
  createDocumentQuery,
  findDocumentQueries,
} from "../../../repositories/attorney/documentQueryRepository";
import { findUserById } from "../../../repositories/common/userRepository";
import { getUserNamespace } from "../../../config/pineconeConfig";
import {
  findEmbeddingJobByIdAndUserId,
  findEmbeddingChunksByJobId,
  findCompletedEmbeddingJobsByUserId,
} from "../../../repositories/client/embeddingJobRepository";
import { processClientFileUpload } from "../embedding/embeddingService";
import {
  queryPineconeNamespace,
  formatQueryResultsForSources,
} from "../../../utils/pineconeQuery";
import {
  createDocumentSession,
  getActiveSession,
  deactivateSession,
} from "../../../repositories/client/documentSessionRepository";
import {
  createMessage,
  getSessionMessages,
  getAllSessionMessages,
} from "../../../repositories/client/documentMessageRepository";
import { JobStatus, MessageRole } from "@prisma/client";
import { ValidationError } from "../../../utils/errors";
import { deductTokens } from "../../../tokenService";
import { getFeatureTokenCost } from "../../pricing/featurePricingService";
import type {
  ProcessingRequest,
  ProcessingResponse,
  QuerySource,
} from "@/types/api";

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
 * Queue document for processing if not already processed
 */
export async function queueDocumentForProcessing(
  documentId: string,
  userId: string
): Promise<{ queued: boolean; status: string; jobId?: string }> {
  const job = await findEmbeddingJobByIdAndUserId(documentId, userId);

  if (!job) {
    throw new ValidationError("Document not found");
  }

  // If already completed, no need to queue
  if (job.status === JobStatus.COMPLETED) {
    return { queued: false, status: "completed", jobId: job.id };
  }

  // If already processing, return status
  if (job.status === JobStatus.PROCESSING) {
    return { queued: false, status: "processing", jobId: job.id };
  }

  // If pending or failed, we need to trigger processing
  // For now, return that it needs processing (actual processing should be triggered separately)
  return { queued: true, status: job.status, jobId: job.id };
}

/**
 * Ensure document is processed, queue if not
 */
export async function ensureDocumentProcessed(
  documentId: string,
  userId: string
): Promise<{ ready: boolean; status: string; queued: boolean }> {
  const queueResult = await queueDocumentForProcessing(documentId, userId);

  if (
    queueResult.status === "completed" ||
    queueResult.status === JobStatus.COMPLETED
  ) {
    return { ready: true, status: "completed", queued: false };
  }

  if (
    queueResult.status === "processing" ||
    queueResult.status === JobStatus.PROCESSING
  ) {
    return { ready: false, status: "processing", queued: false };
  }

  // Document needs processing but is queued
  return {
    ready: false,
    status: queueResult.status,
    queued: queueResult.queued,
  };
}

/**
 * Get or create active session for user
 */
export async function getOrCreateActiveSession(
  userId: string
): Promise<string> {
  let session = await getActiveSession(userId);

  if (!session) {
    session = await createDocumentSession({
      userId,
      title: "Document Assistant Chat",
    });
  }

  return session.id;
}

/**
 * Get conversation history (last 5-10 messages) for context
 */
export async function getConversationHistory(
  sessionId: string,
  limit: number = 10
): Promise<Array<{ role: MessageRole; content: string }>> {
  const messages = await getSessionMessages(sessionId, limit);

  // Convert to format expected by OpenRouter
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
}

/**
 * Save message to session
 */
export async function saveMessageToSession(
  sessionId: string,
  role: MessageRole,
  content: string,
  sources?: QuerySource[],
  tokenCount?: number,
  modelUsed?: string
): Promise<void> {
  const metadata = sources && sources.length > 0 ? { sources } : undefined;

  await createMessage({
    sessionId,
    role,
    content,
    metadata,
    tokenCount,
    modelUsed,
  });
}

/**
 * Update sources display - group by file and count chunks
 */
export function updateSourcesDisplay(
  sources: QuerySource[]
): Array<{ fileName: string; chunkCount: number; fileId: string }> {
  // Group sources by fileId
  const fileMap = new Map<string, { fileName: string; chunkCount: number }>();

  sources.forEach(source => {
    const existing = fileMap.get(source.fileId);
    if (existing) {
      existing.chunkCount += 1;
    } else {
      fileMap.set(source.fileId, {
        fileName: source.fileName,
        chunkCount: 1,
      });
    }
  });

  // Convert map to array
  return Array.from(fileMap.entries()).map(([fileId, data]) => ({
    fileId,
    fileName: data.fileName,
    chunkCount: data.chunkCount,
  }));
}

/**
 * Perform RAG query using embeddings
 */
async function performRAGQuery(
  userId: string,
  userPrompt: string,
  fileFilter?: string,
  conversationHistory?: Array<{ role: MessageRole; content: string }>
): Promise<{ result: string; sources: QuerySource[] }> {
  // Get user and namespace
  const user = await findUserById(userId);
  if (!user) {
    throw new ValidationError("User not found");
  }
  const namespace = getUserNamespace(userId, user.email);

  // Build file name map for better source attribution
  const completedJobs = await findCompletedEmbeddingJobsByUserId(userId);
  const fileNameMap = new Map<string, string>();
  completedJobs.forEach(job => {
    if (job.fileName) {
      fileNameMap.set(job.fileName, job.originalName || job.fileName);
    }
  });

  // Generate query embedding
  const queryEmbedding = await openRouterService.generateEmbedding(userPrompt);

  // Query Pinecone with optional file filter
  const topK = 10; // Retrieve top 10 relevant chunks
  const queryResults = await queryPineconeNamespace(namespace, queryEmbedding, {
    topK,
    includeMetadata: true,
    fileFilter: fileFilter,
  });

  if (queryResults.length === 0) {
    return {
      result:
        "I couldn't find relevant information in your documents to answer this question. Please try rephrasing or ensure your documents are processed.",
      sources: [],
    };
  }

  // Format sources with proper file names
  const sources = formatQueryResultsForSources(queryResults, fileNameMap);

  // Build context from retrieved chunks
  const context = queryResults
    .map((result, idx) => {
      const chunkText = result.metadata.text || "";
      const fileId = result.metadata.fileId || "";
      const fileName =
        fileNameMap.get(fileId) || fileId.split("/").pop() || "Unknown";
      return `[Document: ${fileName}, Chunk ${idx + 1}]:\n${chunkText}`;
    })
    .join("\n\n---\n\n");

  // Create enhanced prompt with context
  const enhancedPrompt = `Based on the following document excerpts, please answer the user's question.

Relevant Document Excerpts:
${context}

User Question: ${userPrompt}

Please provide a clear, helpful answer based on the document excerpts above. If the excerpts don't contain enough information to answer the question fully, say so and provide what information is available.`;

  // Build messages array with conversation history if provided
  const messages: Array<{
    role: "user" | "system" | "assistant";
    content: string;
  }> = [{ role: "system", content: CLIENT_SYSTEM_PROMPT }];

  // Add conversation history (last 5-10 messages)
  if (conversationHistory && conversationHistory.length > 0) {
    // Only include last 8 messages to leave room for current prompt
    const recentHistory = conversationHistory.slice(-8);
    recentHistory.forEach(msg => {
      const role: "user" | "system" | "assistant" =
        msg.role === "USER"
          ? "user"
          : msg.role === "ASSISTANT"
            ? "assistant"
            : "system";
      messages.push({
        role,
        content: msg.content,
      });
    });
  }

  // Add current user prompt
  messages.push({ role: "user", content: enhancedPrompt });

  // Generate AI response with context
  const response = await openRouterService.chat({
    model: openRouterService.getModelForTier("basic"),
    messages,
    max_tokens: openRouterService.getMaxTokensForTier("basic"),
    temperature: 0.3,
  });

  const result =
    response.choices[0]?.message?.content || "No response generated";

  return { result, sources };
}

/**
 * Fetch document content from chunks
 */
async function fetchDocumentContentFromChunks(
  documentId: string,
  userId: string
): Promise<string | null> {
  const job = await findEmbeddingJobByIdAndUserId(documentId, userId);
  if (!job || job.status !== JobStatus.COMPLETED) {
    return null;
  }

  const chunks = await findEmbeddingChunksByJobId(job.id);
  if (!chunks || chunks.length === 0) {
    return null;
  }

  // Sort by chunkIndex and concatenate content
  const sortedChunks = chunks
    .filter(c => c.status === "COMPLETED")
    .sort((a, b) => a.chunkIndex - b.chunkIndex);

  return sortedChunks.map(c => c.content).join("\n\n");
}

/**
 * Perform document analysis for client with hybrid approach
 */
export async function performClientDocumentAnalysis(
  userId: string,
  request: ProcessingRequest
): Promise<ProcessingResponse> {
  let result: string;
  let sources: QuerySource[] = [];
  let processingQueued = false;
  let documentStatus: string | undefined;

  // Handle session management
  let sessionId: string;
  let conversationHistory: Array<{ role: MessageRole; content: string }> = [];

  if (request.isNewConversation) {
    // Deactivate current session if exists
    const currentSession = await getActiveSession(userId);
    if (currentSession) {
      await deactivateSession(currentSession.id, userId);
    }
    // Create new session
    sessionId = await getOrCreateActiveSession(userId);
  } else if (request.sessionId) {
    // Use provided session ID
    sessionId = request.sessionId;
    // Get conversation history (last 5-10 messages)
    conversationHistory = await getConversationHistory(sessionId, 10);
  } else {
    // Get or create active session
    sessionId = await getOrCreateActiveSession(userId);
    // Get conversation history
    conversationHistory = await getConversationHistory(sessionId, 10);
  }

  // Save user message to session
  await saveMessageToSession(sessionId, MessageRole.USER, request.userPrompt);

  // Handle query all documents with RAG
  if (request.queryAllDocuments) {
    const ragResult = await performRAGQuery(
      userId,
      request.userPrompt,
      undefined,
      conversationHistory
    );
    result = ragResult.result;
    sources = ragResult.sources;
  }
  // Handle specific document query
  else if (request.documentId) {
    // Check if document is processed
    const processingStatus = await ensureDocumentProcessed(
      request.documentId,
      userId
    );

    if (!processingStatus.ready) {
      // Document not ready - return status
      return {
        success: false,
        error: `Document is ${processingStatus.status}. Please wait for it to finish processing.`,
        processingQueued: processingStatus.queued,
        documentStatus: processingStatus.status,
      };
    }

    // Try to fetch full content first
    const fullContent = await fetchDocumentContentFromChunks(
      request.documentId,
      userId
    );

    const job = await findEmbeddingJobByIdAndUserId(request.documentId, userId);
    const fileName = job?.fileName || job?.originalName || "document";

    if (fullContent && fullContent.length < 15000) {
      // Use direct content for smaller documents
      const truncatedContent = fullContent.substring(0, 12000);
      const analysisContent = `Document: ${fileName}\n\nContent: ${truncatedContent}\n\nClient Question: ${request.userPrompt}`;

      // Build messages array with conversation history
      const messages: Array<{
        role: "user" | "system" | "assistant";
        content: string;
      }> = [{ role: "system", content: CLIENT_SYSTEM_PROMPT }];

      // Add conversation history if available
      if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-8);
        recentHistory.forEach(msg => {
          const role: "user" | "system" | "assistant" =
            msg.role === "USER"
              ? "user"
              : msg.role === "ASSISTANT"
                ? "assistant"
                : "system";
          messages.push({
            role,
            content: msg.content,
          });
        });
      }

      // Add current user prompt
      messages.push({ role: "user", content: analysisContent });

      const response = await openRouterService.chat({
        model: openRouterService.getModelForTier("basic"),
        messages,
        max_tokens: openRouterService.getMaxTokensForTier("basic"),
        temperature: 0.3,
      });

      result = response.choices[0]?.message?.content || "No response generated";

      // Create a source entry for direct content
      sources = [
        {
          fileId: request.documentId,
          fileName: fileName,
          chunkIndex: 0,
          text: truncatedContent.substring(0, 500),
          score: 1.0,
        },
      ];
    } else {
      // Use RAG with file filter for larger documents or when full content not available
      const ragResult = await performRAGQuery(
        userId,
        request.userPrompt,
        job?.fileName,
        conversationHistory
      );
      result = ragResult.result;
      sources = ragResult.sources;
    }
  }
  // Fallback to basic analysis if no document specified
  else {
    let analysisContent = request.userPrompt;
    if (request.fileContent && request.fileName) {
      // Truncate for basic tier (first 4000 characters)
      const truncatedContent = request.fileContent.substring(0, 4000);
      analysisContent = `Document: ${request.fileName}\n\nContent: ${truncatedContent}\n\nClient Question: ${request.userPrompt}`;
    }

    // Build messages array with conversation history
    const messages: Array<{
      role: "user" | "system" | "assistant";
      content: string;
    }> = [{ role: "system", content: CLIENT_SYSTEM_PROMPT }];

    // Add conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-8);
      recentHistory.forEach(msg => {
        const role: "user" | "system" | "assistant" =
          msg.role === "USER"
            ? "user"
            : msg.role === "ASSISTANT"
              ? "assistant"
              : "system";
        messages.push({
          role,
          content: msg.content,
        });
      });
    }

    // Add current user prompt
    messages.push({ role: "user", content: analysisContent });

    const response = await openRouterService.chat({
      model: openRouterService.getModelForTier("basic"),
      messages,
      max_tokens: openRouterService.getMaxTokensForTier("basic"),
      temperature: 0.3,
    });

    result = response.choices[0]?.message?.content || "No response generated";
  }

  // Save assistant response to session
  const modelUsed = openRouterService.getModelForTier("basic");
  const tokenCount = result.length / 4; // Rough estimate (4 chars per token)
  await saveMessageToSession(
    sessionId,
    MessageRole.ASSISTANT,
    result,
    sources,
    Math.round(tokenCount),
    modelUsed
  );

  // Update sources display - group by file and count chunks
  const groupedSources = updateSourcesDisplay(sources);

  // Determine if this is a follow-up question
  const isFollowUp = conversationHistory.length > 0;
  const parentQueryId = isFollowUp
    ? conversationHistory[conversationHistory.length - 1]?.role ===
      MessageRole.ASSISTANT
      ? "follow-up"
      : undefined
    : undefined;

  // Save to database (non-blocking)
  try {
    const filesProcessed =
      sources.length > 0
        ? groupedSources.map(s => ({
            fileName: s.fileName,
            chunkCount: s.chunkCount,
          }))
        : request.fileName
          ? [
              {
                fileName: request.fileName,
                fileSize: request.fileContent?.length || 0,
              },
            ]
          : undefined;

    await createDocumentQuery({
      userQuery: request.userPrompt,
      aiResponse: result,
      searchQuery: request.searchQuery || null,
      success: true,
      confidence: sources.length > 0 ? 0.9 : 0.85,
      processingTime: 0,
      totalSteps: 1,
      completedSteps: 1,
      toolsUsed:
        sources.length > 0 ? ["rag", "openrouter_ai"] : ["openrouter_ai"],
      filesProcessed,
      userId,
      documentSessionId: sessionId,
      followUpQuestion: isFollowUp,
      parentQueryId: parentQueryId || null,
      conversationContext:
        conversationHistory.length > 0
          ? { messageCount: conversationHistory.length }
          : null,
    });
  } catch (dbError) {
    console.error("Failed to save query to database:", dbError);
  }

  // Convert grouped sources back to QuerySource format for response (with chunk counts)
  const sourcesWithChunkCounts: QuerySource[] = groupedSources.map(gs => {
    // Find first source from this file to get fileId
    const firstSource = sources.find(s => s.fileId === gs.fileId);
    return {
      fileId: gs.fileId,
      fileName: `${gs.fileName} (${gs.chunkCount} ${gs.chunkCount === 1 ? "chunk" : "chunks"})`,
      chunkIndex: -1, // Not showing individual chunks
      text: firstSource?.text || "",
      score: firstSource?.score || 0,
    };
  });

  // Consume tokens after successful query - get cost from database
  let tokenCost: number;
  try {
    tokenCost = await getFeatureTokenCost("document-assistant", "CUSTOMER");
  } catch (pricingError) {
    // Fallback to default if pricing not found
    console.error(
      'Failed to get pricing for feature "document-assistant":',
      pricingError
    );
    tokenCost = 5;
  }

  try {
    await deductTokens(
      userId,
      tokenCost,
      "Document Assistant query",
      "document-assistant",
      {
        operation: "query",
        sessionId,
      }
    );
  } catch (tokenError) {
    console.error("Failed to consume tokens:", tokenError);
    // Don't fail the request if token consumption fails
  }

  return {
    success: true,
    result,
    confidence: sources.length > 0 ? 0.9 : 0.85,
    operationChain: [
      { operation: "analysis", confidence: sources.length > 0 ? 0.9 : 0.85 },
    ],
    totalSteps: 1,
    completedSteps: 1,
    responseMode: "question_answering",
    sources: sourcesWithChunkCounts,
    processingQueued,
    documentStatus,
    sessionId,
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
