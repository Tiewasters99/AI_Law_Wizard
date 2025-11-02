// Service for document processing functionality

import { createDocumentQuery } from "../../../repositories/attorney/documentQueryRepository";
import { openRouterService } from "../../openRouterService";
import type { ProcessingRequest, ProcessingResponse } from "@/types/api";

const MODELS = {
  GPT4O_MINI: "openai/gpt-4o-mini",
  GROK_4_LATEST: "x-ai/grok-4-latest",
} as const;

/**
 * Detect response mode from user prompt
 */
async function detectResponseMode(
  userPrompt: string
): Promise<"question_answering" | "action_performance"> {
  const questionKeywords = [
    "what", "how", "why", "when", "where", "who", "which", "explain",
    "describe", "tell me", "show me", "give me", "find", "search",
    "summarize", "summary", "analyze", "analysis", "extract",
  ];

  const actionKeywords = [
    "edit", "modify", "change", "update", "add", "remove", "delete",
    "create", "write", "generate", "draft", "rewrite", "reformat",
  ];

  const lowerPrompt = userPrompt.toLowerCase();

  const questionScore = questionKeywords.reduce(
    (score, keyword) => score + (lowerPrompt.includes(keyword) ? 1 : 0),
    0
  );

  const actionScore = actionKeywords.reduce(
    (score, keyword) => score + (lowerPrompt.includes(keyword) ? 1 : 0),
    0
  );

  if (questionScore > actionScore) {
    return "question_answering";
  }

  if (actionScore > 0) {
    return "action_performance";
  }

  // Default to question answering
  return "question_answering";
}

/**
 * Search for relevant files (mock implementation - would integrate with Pinecone)
 */
async function searchRelevantFiles(query: string): Promise<any> {
  // This is a placeholder - in production would integrate with vector search
  return {
    success: true,
    files: [],
    error: null,
  };
}

/**
 * Process documents
 */
export async function processDocuments(
  request: ProcessingRequest,
  userId?: string
): Promise<ProcessingResponse> {
  const startTime = Date.now();

  // Handle free tier with direct file content
  if (request.skipVectorSearch && request.fileContent) {
    const response = await openRouterService.chat({
      model: MODELS.GPT4O_MINI,
      messages: [
        {
          role: "system",
          content: `Analyze the provided document and answer the user's question accurately.

Document Content:
${request.fileContent.substring(0, 30000)}

${request.fileContent.length > 30000 ? "\n[Note: Content truncated for processing.]" : ""}

Provide a detailed analysis in markdown format.`,
        },
        { role: "user", content: request.userPrompt },
      ],
      max_tokens: 4000,
      temperature: 0.1,
    });

    return {
      success: true,
      result: response.choices[0]?.message?.content || "",
      responseMode: "question_answering",
      processedFiles: [
        {
          fileId: "free-tier-upload",
          fileName: request.fileName || "Uploaded Document",
          originalName: request.fileName || "Uploaded Document",
          fileSize: request.fileContent.length,
        },
      ],
    };
  }

  // Regular processing with vector search
  const responseMode = await detectResponseMode(request.userPrompt);
  const fileSearchResult = await searchRelevantFiles(
    request.searchQuery || request.userPrompt
  );

  if (!fileSearchResult.success || !fileSearchResult.files?.length) {
    throw new Error("No relevant files found for the query");
  }

  const model =
    responseMode === "question_answering" ? MODELS.GPT4O_MINI : MODELS.GROK_4_LATEST;

  const response = await openRouterService.chat({
    model,
    messages: [
      {
        role: "system",
        content:
          responseMode === "question_answering"
            ? "You are a helpful assistant that answers questions based on document content."
            : "You are a file editing assistant. Provide edited content and change summaries.",
      },
      {
        role: "user",
        content: `${request.userPrompt}\n\nDocument content: ${JSON.stringify(fileSearchResult.files)}`,
      },
    ],
    max_tokens: 4000,
    temperature: 0.1,
  });

  const processingTime = Date.now() - startTime;
  const result = response.choices[0]?.message?.content || "";

  // Save query to database (non-blocking)
  try {
    await createDocumentQuery({
      userQuery: request.userPrompt,
      aiResponse: result,
      searchQuery: request.searchQuery || null,
      success: true,
      confidence: 0.9,
      processingTime,
      totalSteps: 2,
      completedSteps: 2,
      toolsUsed: ["file_processing_tool"],
      filesProcessed: fileSearchResult.files,
      userId: userId || null,
    });
  } catch (dbError) {
    console.error("Failed to save query:", dbError);
  }

  return {
    success: true,
    result,
    processedFiles: fileSearchResult.files.map((file: any) => ({
      fileId: file.fileId,
      fileName: file.fileName,
      originalName: file.originalName,
      fileSize: file.fileSize,
      fileType: file.fileType,
    })),
    confidence: 0.9,
    operationChain: [{ operation: responseMode === "question_answering" ? "qa" : responseMode, confidence: 0.9 }],
    totalSteps: 2,
    completedSteps: 2,
    responseMode,
  };
}

