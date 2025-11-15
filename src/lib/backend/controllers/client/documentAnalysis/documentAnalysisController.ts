// Controller for client document analysis API endpoints

import { NextRequest, NextResponse } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import {
  performClientDocumentAnalysis,
  getClientDocumentAnalysisHistory,
} from "../../../services/client/documentAnalysis/documentAnalysisService";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateNonEmptyString } from "../../../utils/validation";
import { checkRateLimit, getRateLimitHeaders } from "../../../api/rateLimiter";
import type { ProcessingRequest } from "@/types/api";

/**
 * Handle POST request - Perform document analysis
 */
export async function handleDocumentAnalysis(
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

    const body: ProcessingRequest = await request.json();
    const {
      userPrompt,
      documentId,
      queryAllDocuments,
      sessionId,
      isNewConversation,
    } = body;

    validateNonEmptyString(userPrompt, "User prompt");

    // Validate that either documentId or queryAllDocuments is set, but not both
    if (documentId && queryAllDocuments) {
      return errorResponse(
        new Error("Cannot specify both documentId and queryAllDocuments"),
        "Invalid request parameters"
      );
    }

    // Pass sessionId and isNewConversation to service
    const result = await performClientDocumentAnalysis(userId, {
      ...body,
      sessionId,
      isNewConversation,
    });

    return successResponse(result, 200, {
      headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
    });
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
    await verifyClientAccess(userId);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const result = await getClientDocumentAnalysisHistory(userId, {
      page,
      limit,
      search,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch query history");
  }
}
