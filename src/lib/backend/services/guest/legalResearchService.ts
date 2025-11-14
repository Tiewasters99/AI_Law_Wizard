// Service for guest legal research functionality

import {
  invokeLegalResearch,
  streamLegalResearch,
} from "../../services/langchain/legalResearchChain";
import {
  getHistory,
  saveMessage,
  generateSessionId,
  sessionExists,
} from "../../repositories/guest/guestSessionRepository";
import { DemoProcessingResponse } from "@/types/api";

export interface GuestLegalResearchRequest {
  query: string;
  sessionId?: string;
  jurisdiction?: string;
  caseType?: string;
}

/**
 * Perform guest legal research with conversation memory using LangChain
 */
export async function performGuestLegalResearch(
  request: GuestLegalResearchRequest
): Promise<DemoProcessingResponse & { sessionId: string }> {
  // Get or create session ID
  let sessionId = request.sessionId || generateSessionId();

  // If sessionId was provided but doesn't exist, create new one
  if (request.sessionId && !sessionExists(request.sessionId)) {
    sessionId = generateSessionId();
  }

  // Build research query with optional context
  let researchQuery = request.query;
  if (request.jurisdiction || request.caseType) {
    const contextParts: string[] = [];
    if (request.jurisdiction) {
      contextParts.push(`Jurisdiction: ${request.jurisdiction}`);
    }
    if (request.caseType) {
      contextParts.push(`Case Type: ${request.caseType}`);
    }
    if (contextParts.length > 0) {
      researchQuery = `${researchQuery}\n\nContext: ${contextParts.join(", ")}`;
    }
  }

  try {
    // Get conversation history (without current query)
    const history = getHistory(sessionId);

    // Invoke LangChain with history and query
    // Note: invokeLegalResearch will add the user query internally
    const result = await invokeLegalResearch(history, researchQuery);

    // Save both messages to history after successful invocation
    saveMessage(sessionId, "user", researchQuery);
    saveMessage(sessionId, "assistant", result);

    return {
      success: true,
      result,
      isDemo: true,
      sessionId,
      limitations: [
        "Limited to general legal concepts",
        "No case law database access",
        "No statute research",
        "Basic research guidance only",
      ],
      upgradeMessage:
        "Upgrade to access comprehensive legal databases, case law research, and advanced search capabilities",
    };
  } catch (error) {
    console.error("Legal research service error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to perform legal research");
  }
}

/**
 * Stream guest legal research with conversation memory using LangChain
 * Returns an async generator that yields content chunks
 */
export async function* streamGuestLegalResearch(
  request: GuestLegalResearchRequest
): AsyncGenerator<string, { sessionId: string; fullResult: string }, unknown> {
  // Get or create session ID
  let sessionId = request.sessionId || generateSessionId();

  // If sessionId was provided but doesn't exist, create new one
  if (request.sessionId && !sessionExists(request.sessionId)) {
    sessionId = generateSessionId();
  }

  // Build research query with optional context
  let researchQuery = request.query;
  if (request.jurisdiction || request.caseType) {
    const contextParts: string[] = [];
    if (request.jurisdiction) {
      contextParts.push(`Jurisdiction: ${request.jurisdiction}`);
    }
    if (request.caseType) {
      contextParts.push(`Case Type: ${request.caseType}`);
    }
    if (contextParts.length > 0) {
      researchQuery = `${researchQuery}\n\nContext: ${contextParts.join(", ")}`;
    }
  }

  try {
    // Get conversation history (without current query)
    const history = getHistory(sessionId);

    // Stream from LangChain
    let fullResult = "";
    for await (const chunk of streamLegalResearch(history, researchQuery)) {
      fullResult += chunk;
      yield chunk;
    }

    // Save both messages to history after successful streaming
    saveMessage(sessionId, "user", researchQuery);
    saveMessage(sessionId, "assistant", fullResult);

    return { sessionId, fullResult };
  } catch (error) {
    console.error("Legal research streaming service error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to stream legal research");
  }
}
