// Controller for client legal research API endpoints

import { NextRequest } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import {
  performClientLegalResearch,
  streamClientLegalResearch,
} from "../../../services/client/legalResearch/legalResearchService";
import {
  createOrGetChatSession,
  createNewChatSession,
  generateSessionTitle,
} from "../../../services/client/chat/chatService";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateNonEmptyString } from "../../../utils/validation";
import { checkRateLimit, getRateLimitHeaders } from "../../../api/rateLimiter";
import { ValidationError, RateLimitError } from "../../../utils/errors";

/**
 * Handle POST request - Perform legal research with streaming support
 */
export async function handleLegalResearch(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    // Rate limiting
    const rateLimit = checkRateLimit(request, userId, "CLIENT", true);
    if (!rateLimit.allowed) {
      const error = new RateLimitError(
        "Rate limit exceeded. Please try again later.",
        rateLimit.resetTime
      );
      return errorResponse(error);
    }

    const body = await request.json();
    const { query, jurisdiction, caseType, model, stream, sessionId, showReasoning, newChat } = body;

    // Validate input
    const validatedQuery = validateNonEmptyString(query, "Research query");

    // Handle session management - ensure we always have a sessionId
    let activeSessionId = sessionId;
    if (!activeSessionId || newChat) {
      try {
        // Create a new session or get active session
        if (newChat) {
          const newSession = await createNewChatSession(userId);
          activeSessionId = newSession.id;
        } else {
          const session = await createOrGetChatSession(userId);
          activeSessionId = session.id;
        }
      } catch (sessionError) {
        console.error("Failed to create or get chat session:", sessionError);
        // Try to create a new session as fallback
        try {
          const fallbackSession = await createNewChatSession(userId);
          activeSessionId = fallbackSession.id;
        } catch (fallbackError) {
          console.error("Failed to create fallback chat session:", fallbackError);
          // Continue without sessionId - messages won't be saved but request can still proceed
          activeSessionId = undefined;
        }
      }
    }

    // Check if streaming is requested
    if (stream === true) {
      // Create a readable stream for Server-Sent Events
      const encoder = new TextEncoder();
      const streamResponse = new ReadableStream({
        async start(controller) {
          try {
            // Stream the research results
            const streamGenerator = streamClientLegalResearch(userId, {
              query: validatedQuery,
              jurisdiction,
              caseType,
              model,
              sessionId: activeSessionId,
              showReasoning: showReasoning === true,
            });

            // Send content chunks as they arrive
            let finalResult: { fullResult: string } | null = null;
            let result = await streamGenerator.next();

            while (!result.done) {
              // Send content chunk as SSE
              const data = JSON.stringify({
                type: "content",
                content: result.value,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              result = await streamGenerator.next();
            }

            // Capture the final return value (fullResult)
            if (result.done && result.value) {
              finalResult = result.value;
              
              // Session title will be updated after messages are saved
            }

            // Send completion message with sessionId (use from finalResult if available, otherwise use activeSessionId)
            const finalSessionId = finalResult?.sessionId || activeSessionId;
            const doneData = JSON.stringify({
              type: "done",
              sessionId: finalSessionId,
            });
            controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
            controller.close();
          } catch (error) {
            console.error("Error in streaming legal research:", error);
            // Send error as SSE, but still include sessionId if available
            const errorData = JSON.stringify({
              type: "error",
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to stream legal research",
              sessionId: activeSessionId, // Include sessionId even on error so frontend can track it
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
          }
        },
      });

      // Get rate limit headers
      const headers = getRateLimitHeaders(
        rateLimit.remaining,
        rateLimit.resetTime
      );

      // Return streaming response with SSE headers
      return new Response(streamResponse, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          ...headers,
        },
      });
    } else {
      // Non-streaming response
      const result = await performClientLegalResearch(userId, {
        query: validatedQuery,
        jurisdiction,
        caseType,
        model,
        sessionId: activeSessionId,
        showReasoning: showReasoning === true,
      });

      // Session title will be updated after messages are saved

      return successResponse({ ...result, sessionId: activeSessionId }, 200, {
        headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
      });
    }
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof RateLimitError ||
      error instanceof Error
    ) {
      return errorResponse(error);
    }
    return errorResponse(error, "Legal research failed");
  }
}
