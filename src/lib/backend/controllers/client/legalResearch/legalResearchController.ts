// Controller for client legal research API endpoints

import { NextRequest, NextResponse } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import { performClientLegalResearch } from "../../../services/client/legalResearch/legalResearchService";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateNonEmptyString } from "../../../utils/validation";
import { checkRateLimit, getRateLimitHeaders } from "../../../api/rateLimiter";

/**
 * Handle POST request - Perform legal research
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
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { query, jurisdiction, caseType } = body;

    validateNonEmptyString(query, "Research query");

    const result = await performClientLegalResearch(userId, {
      query,
      jurisdiction,
      caseType,
    });

    return successResponse(result, 200, {
      headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
    });
  } catch (error) {
    return errorResponse(error, "Legal research failed");
  }
}
