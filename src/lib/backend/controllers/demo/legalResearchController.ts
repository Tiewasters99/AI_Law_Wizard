// Controller for demo legal research API endpoint

import { NextRequest } from "next/server";
import { performDemoLegalResearch } from "../../services/demo/legalResearchService";
import { errorResponse, successResponse } from "../../utils/response";
import { ValidationError } from "../../utils/errors";
import { validateNonEmptyString } from "../../utils/validation";

/**
 * Handle POST request for demo legal research
 */
export async function handleDemoLegalResearch(
  request: NextRequest
): Promise<Response> {
  try {
    const body = await request.json();
    const { query, jurisdiction, caseType } = body;

    // Validate input
    const validatedQuery = validateNonEmptyString(query, "Research query");

    // Call service
    const result = await performDemoLegalResearch({
      query: validatedQuery,
      jurisdiction,
      caseType,
    });

    return successResponse(result);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
      return errorResponse(error);
    }
    return errorResponse(error, "Demo research failed. Please try again.");
  }
}
