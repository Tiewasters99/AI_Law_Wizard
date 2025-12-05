// Controller for demo document analysis API endpoint

import { NextRequest } from "next/server";
import { performDemoDocumentAnalysis } from "../../services/demo/documentAnalysisService";
import { errorResponse, successResponse } from "../../utils/response";
import { ValidationError } from "../../utils/errors";
import { validateNonEmptyString } from "../../utils/validation";

/**
 * Handle POST request for demo document analysis
 */
export async function handleDemoDocumentAnalysis(
  request: NextRequest
): Promise<Response> {
  try {
    const body = await request.json();
    const { userIssue, fileContent, fileName } = body;

    // Validate input
    const validatedIssue = validateNonEmptyString(userIssue, "User issue");

    // Call service
    const result = await performDemoDocumentAnalysis({
      userIssue: validatedIssue,
      fileContent,
      fileName,
    });

    return successResponse(result);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
      return errorResponse(error);
    }
    return errorResponse(error, "Demo analysis failed. Please try again.");
  }
}
