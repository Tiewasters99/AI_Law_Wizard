// Controller for attorney document analysis API endpoints

import { NextRequest } from "next/server";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import {
  performDocumentAnalysis,
  getDocumentAnalysisHistory,
} from "../../../services/attorney/documentAnalysis/documentAnalysisService";
import { checkRateLimit, getRateLimitHeaders } from "../../../api/rateLimiter";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateNonEmptyString } from "../../../utils/validation";
import { RateLimitError } from "../../../utils/errors";
import type { ProcessingRequest } from "@/types/api";

/**
 * Handle POST request - Perform document analysis
 */
export async function handleDocumentAnalysis(
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

    const body: ProcessingRequest = await request.json();
    const { userPrompt } = body;

    validateNonEmptyString(userPrompt, "User prompt");

    const result = await performDocumentAnalysis(userId, body);

    const headers = getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime);
    return successResponse(result, 200, { headers });
  } catch (error) {
    return errorResponse(error, "Document analysis failed");
  }
}

/**
 * Handle GET request - Get document analysis history
 */
export async function handleGetDocumentAnalysisHistory(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || undefined;

    const result = await getDocumentAnalysisHistory(page, limit, search);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch query history");
  }
}

