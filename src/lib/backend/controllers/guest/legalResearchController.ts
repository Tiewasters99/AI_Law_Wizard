// Controller for guest legal research API endpoint

import { NextRequest } from "next/server";
import { performGuestLegalResearch } from "../../services/guest/legalResearchService";
import { errorResponse, successResponse } from "../../utils/response";
import { ValidationError, RateLimitError } from "../../utils/errors";
import { validateNonEmptyString } from "../../utils/validation";
import {
  checkRateLimit,
  getRateLimitHeaders,
} from "../../api/rateLimiter";

/**
 * Handle POST request for guest legal research
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
    const { query, jurisdiction, caseType } = body;

    // Validate input
    const validatedQuery = validateNonEmptyString(query, "Research query");

    // Call service
    const result = await performGuestLegalResearch({
      query: validatedQuery,
      jurisdiction,
      caseType,
    });

    const headers = getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime);
    return successResponse(result, 200, { headers });
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

