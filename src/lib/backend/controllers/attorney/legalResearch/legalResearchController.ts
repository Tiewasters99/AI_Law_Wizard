// Controller for attorney legal research API endpoint

import { NextRequest } from "next/server";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import { performLegalResearch } from "../../../services/attorney/legalResearch/legalResearchService";
import { checkRateLimit, getRateLimitHeaders } from "../../../api/rateLimiter";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateNonEmptyString } from "../../../utils/validation";
import { RateLimitError } from "../../../utils/errors";

/**
 * Handle POST request - Perform legal research
 */
export async function handleLegalResearch(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    // Rate limiting
    const rateLimit = checkRateLimit(request, userId, "ATTORNEY", true);
    if (!rateLimit.allowed) {
      const error = new RateLimitError(
        "Rate limit exceeded. Please try again later.",
        rateLimit.resetTime
      );
      return errorResponse(error);
    }

    const body = await request.json();
    const { query, jurisdiction, caseType, practiceArea } = body;

    validateNonEmptyString(query, "Research query");

    const result = await performLegalResearch(userId, {
      query,
      jurisdiction,
      caseType,
      practiceArea,
    });

    const headers = getRateLimitHeaders(
      rateLimit.remaining,
      rateLimit.resetTime
    );
    return successResponse(result, 200, { headers });
  } catch (error) {
    return errorResponse(error, "Legal research failed");
  }
}
