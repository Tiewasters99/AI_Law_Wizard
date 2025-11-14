// Service for client legal research functionality
// Uses LangChain-style message handling with scratchpad reasoning

import { openRouterService } from "../../openRouterService";
import {
  invokeLegalResearchChain,
  streamLegalResearchChain,
} from "../../langchain/clientLegalResearchChain";
import {
  saveChatMessage,
  loadChatMessages,
  updateSessionTitle,
  getChatSession,
  generateSessionTitle,
} from "../chat/chatService";
import { deductTokens } from "../../../tokenService";

// Prompts are now handled by the LangChain chain in clientLegalResearchChain.ts

export interface LegalResearchRequest {
  query: string;
  jurisdiction?: string;
  caseType?: string;
  model?: string; // Optional model override (e.g., "openai/gpt-4o-mini", "google/gemini-2.0-flash-exp")
  sessionId?: string; // Chat session ID for conversation history
  showReasoning?: boolean; // Enable reasoning mode
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

  // Load conversation history if sessionId is provided
  const conversationHistory: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }> = [];
  if (request.sessionId) {
    try {
      const previousMessages = await loadChatMessages(request.sessionId);
      // Convert ChatMessage format to history format
      for (const msg of previousMessages) {
        const role = msg.role.toLowerCase() as "user" | "assistant" | "system";
        conversationHistory.push({
          role:
            role === "user"
              ? "user"
              : role === "assistant"
                ? "assistant"
                : "system",
          content: msg.content,
        });
      }
    } catch (error) {
      console.error("Failed to load conversation history:", error);
      // Continue without history if loading fails
    }
  }

  // Determine model to use
  const model = request.model || openRouterService.getModelForTier("basic");
  const maxTokens = request.model
    ? request.model.includes("gemini")
      ? 8000
      : 4000
    : openRouterService.getMaxTokensForTier("basic");

  // Save user message immediately before processing if sessionId is provided
  if (request.sessionId) {
    try {
      await saveChatMessage(request.sessionId, "USER", request.query, {
        jurisdiction: request.jurisdiction,
        caseType: request.caseType,
      });
      
      // Update session title from first user message if needed
      try {
        const session = await getChatSession(request.sessionId);
        if (!session.title) {
          const title = generateSessionTitle(request.query);
          await updateSessionTitle(request.sessionId, title);
        }
      } catch (titleError) {
        console.error("Failed to update session title:", titleError);
        // Continue even if title update fails
      }
    } catch (dbError) {
      console.error("Failed to save user chat message:", dbError);
      // Continue processing even if saving user message fails
    }
  }

  let result: string;
  let processingError: Error | null = null;

  try {
    // Use LangChain chain for legal research with scratchpad reasoning
    result = await invokeLegalResearchChain(
      request.query,
      conversationHistory,
      model,
      maxTokens,
      request.showReasoning || false
    );
  } catch (error) {
    console.error("Legal research processing error:", error);
    processingError = error instanceof Error
      ? error
      : new Error("Failed to perform legal research");
    result = `Error: ${processingError.message}`;
  }

  // Save assistant response even if processing failed
  if (request.sessionId) {
    try {
      await saveChatMessage(
        request.sessionId,
        "ASSISTANT",
        result,
        {
          showReasoning: request.showReasoning,
          model,
          error: processingError ? processingError.message : undefined,
        },
        undefined,
        model
      );
    } catch (dbError) {
      console.error("Failed to save assistant chat message:", dbError);
      // Log but don't throw - we want to return the error from processing if it occurred
    }
  }

  // Re-throw processing error if one occurred
  if (processingError) {
    throw processingError;
  }

  // Consume tokens after successful research
  // Determine feature based on model: grand-wizard uses gemini-2.5-pro, wizard uses basic models
  const isGrandWizard = model.includes("gemini-2.5-pro") || model.includes("gemini-2.0");
  const feature = isGrandWizard ? "grand-wizard" : "wizard";
  const tokenCost = isGrandWizard ? 5 : 2;

  try {
    await deductTokens(
      userId,
      tokenCost,
      `${isGrandWizard ? "Grand Wizard" : "Legal Chat"} message`,
      feature,
      {
        operation: "chat-message",
        sessionId: request.sessionId,
        model,
        caseType: request.caseType,
      }
    );
  } catch (tokenError) {
    console.error("Failed to consume tokens:", tokenError);
    // Don't fail the request if token consumption fails
  }

  // Note: This is conversational LLM research, not document analysis
  // Chat messages are tracked in ChatMessage table, no need for DocumentQuery

  return {
    success: true,
    result,
    confidence: 0.85,
    researchType: "basic",
    jurisdiction: request.jurisdiction || "general",
    practiceArea: request.caseType || "general",
    sessionId: request.sessionId,
  };
}

/**
 * Stream legal research for client
 * Returns an async generator that yields content chunks
 */
export async function* streamClientLegalResearch(
  userId: string,
  request: LegalResearchRequest
): AsyncGenerator<string, { fullResult: string; sessionId?: string }, unknown> {
  if (!request.query) {
    throw new Error("Research query is required");
  }

  // Load conversation history if sessionId is provided
  const conversationHistory: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }> = [];
  if (request.sessionId) {
    try {
      const previousMessages = await loadChatMessages(request.sessionId);
      // Convert ChatMessage format to history format
      for (const msg of previousMessages) {
        const role = msg.role.toLowerCase() as "user" | "assistant" | "system";
        conversationHistory.push({
          role:
            role === "user"
              ? "user"
              : role === "assistant"
                ? "assistant"
                : "system",
          content: msg.content,
        });
      }
    } catch (error) {
      console.error("Failed to load conversation history:", error);
      // Continue without history if loading fails
    }
  }

  // Determine model to use
  const model = request.model || openRouterService.getModelForTier("basic");
  const maxTokens = request.model
    ? request.model.includes("gemini")
      ? 8000
      : 4000
    : openRouterService.getMaxTokensForTier("basic");

  // Save user message immediately before processing if sessionId is provided
  if (request.sessionId) {
    try {
      await saveChatMessage(request.sessionId, "USER", request.query, {
        jurisdiction: request.jurisdiction,
        caseType: request.caseType,
      });
      
      // Update session title from first user message if needed
      try {
        const session = await getChatSession(request.sessionId);
        if (!session.title) {
          const title = generateSessionTitle(request.query);
          await updateSessionTitle(request.sessionId, title);
        }
      } catch (titleError) {
        console.error("Failed to update session title:", titleError);
        // Continue even if title update fails
      }
    } catch (dbError) {
      console.error("Failed to save user chat message:", dbError);
      // Continue processing even if saving user message fails
    }
  }

  let fullResult = "";
  let streamingError: Error | null = null;

  try {
    // Use LangChain chain for streaming legal research with scratchpad reasoning
    for await (const chunk of streamLegalResearchChain(
      request.query,
      conversationHistory,
      model,
      maxTokens,
      request.showReasoning || false
    )) {
      fullResult += chunk;
      yield chunk;
    }
  } catch (error) {
    console.error("Legal research streaming error:", error);
    streamingError = error instanceof Error
      ? error
      : new Error("Failed to stream legal research");
    // Re-throw after saving what we can
  }

  // Save assistant response even if streaming failed (save partial or error message)
  if (request.sessionId) {
    try {
      const assistantContent = streamingError
        ? `Error: ${streamingError.message}\n\nPartial response: ${fullResult || "No response received"}`
        : fullResult;

      await saveChatMessage(
        request.sessionId,
        "ASSISTANT",
        assistantContent,
        {
          showReasoning: request.showReasoning,
          model,
          error: streamingError ? streamingError.message : undefined,
        },
        undefined, // tokenCount - could be calculated if needed
        model
      );
    } catch (dbError) {
      console.error("Failed to save assistant chat message:", dbError);
      // Log but don't throw - we want to return the error from streaming if it occurred
    }
  }

  // Re-throw streaming error if one occurred
  if (streamingError) {
    throw streamingError;
  }

  // Consume tokens after successful streaming research
  // Determine feature based on model: grand-wizard uses gemini-2.5-pro, wizard uses basic models
  const isGrandWizard = model.includes("gemini-2.5-pro") || model.includes("gemini-2.0");
  const feature = isGrandWizard ? "grand-wizard" : "wizard";
  const tokenCost = isGrandWizard ? 5 : 2;

  try {
    await deductTokens(
      userId,
      tokenCost,
      `${isGrandWizard ? "Grand Wizard" : "Legal Chat"} message`,
      feature,
      {
        operation: "chat-message",
        sessionId: request.sessionId,
        model,
        caseType: request.caseType,
      }
    );
  } catch (tokenError) {
    console.error("Failed to consume tokens:", tokenError);
    // Don't fail the request if token consumption fails
  }

  // Note: This is conversational LLM research, not document analysis
  // Chat messages are tracked in ChatMessage table, no need for DocumentQuery

  return { fullResult, sessionId: request.sessionId };
}
