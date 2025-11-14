// Controller for guest legal research API endpoint

import { NextRequest } from "next/server";
import { streamGuestLegalResearch } from "../../services/guest/legalResearchService";
import { errorResponse } from "../../utils/response";
import { ValidationError, RateLimitError } from "../../utils/errors";
import { validateNonEmptyString } from "../../utils/validation";
import { checkRateLimit, getRateLimitHeaders } from "../../api/rateLimiter";

/**
 * Handle POST request for guest legal research with streaming support
 */
export async function handleGuestLegalResearch(
  request: NextRequest
): Promise<Response> {
  try {
    // Rate limiting for guest users
    const rateLimit = checkRateLimit(request, null, "GUEST", false);
    if (!rateLimit.allowed) {
      const error = new RateLimitError(
        "Rate limit exceeded. Please try again later.",
        rateLimit.resetTime
      );
      return errorResponse(error);
    }

    const body = await request.json();
    const { query, sessionId, jurisdiction, caseType } = body;

    // Validate input
    const validatedQuery = validateNonEmptyString(query, "Research query");

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the research results
          const streamGenerator = streamGuestLegalResearch({
            query: validatedQuery,
            sessionId: sessionId || undefined,
            jurisdiction,
            caseType,
          });

          // Send content chunks as they arrive
          let finalMetadata: { sessionId: string; fullResult: string } | null =
            null;
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

          // Capture the final return value (sessionId and fullResult)
          if (result.done && result.value) {
            finalMetadata = result.value;
          }

          // Send completion message with metadata
          const doneData = JSON.stringify({
            type: "done",
            sessionId: finalMetadata?.sessionId,
          });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
          controller.close();
        } catch (error) {
          // Send error as SSE
          const errorData = JSON.stringify({
            type: "error",
            error:
              error instanceof Error
                ? error.message
                : "Failed to stream legal research",
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
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        ...headers,
      },
    });
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof RateLimitError ||
      error instanceof Error
    ) {
      return errorResponse(error);
    }
    return errorResponse(error, "Demo research failed");
  }
}
