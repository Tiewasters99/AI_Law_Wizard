// Controller for document processing API endpoint

import { NextRequest } from "next/server";
import { processDocuments } from "../../../services/attorney/documentProcessing/documentProcessingService";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateNonEmptyString } from "../../../utils/validation";
import type { ProcessingRequest } from "@/types/api";

/**
 * Handle POST request - Process documents
 */
export async function handleProcessDocuments(
  request: NextRequest,
  userId?: string
): Promise<Response> {
  try {
    const body: ProcessingRequest = await request.json();
    const { userPrompt } = body;

    validateNonEmptyString(userPrompt, "User prompt");

    const result = await processDocuments(body, userId);

    if (result.success) {
      return successResponse(result);
    } else {
      return errorResponse(new Error(result.error), result.error || "Processing failed");
    }
  } catch (error) {
    return errorResponse(error, "Internal server error during document processing");
  }
}

