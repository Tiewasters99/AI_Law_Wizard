// Controller for file content API endpoints

import { NextRequest } from "next/server";
import { getFileContent } from "../../../services/attorney/documentProcessing/fileContentService";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateRequired } from "../../../utils/validation";

/**
 * Handle POST request - Get file content
 */
export async function handleGetFileContent(
  request: NextRequest
): Promise<Response> {
  try {
    const body = await request.json();
    const { fileId, fileName } = body;

    validateRequired(fileId, "File ID");
    validateRequired(fileName, "File name");

    const content = await getFileContent(fileId, fileName);

    return successResponse({
      success: true,
      content,
    });
  } catch (error) {
    return errorResponse(
      error,
      "Internal server error while retrieving file content"
    );
  }
}

/**
 * Handle GET request - Get file content
 */
export async function handleGetFileContentGet(
  request: NextRequest
): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");
    const fileName = searchParams.get("fileName");

    validateRequired(fileId, "File ID");
    validateRequired(fileName, "File name");

    // Ensure fileId and fileName are strings (not null) before passing to getFileContent
    const content = await getFileContent(fileId as string, fileName as string);

    return successResponse({
      success: true,
      content,
    });
  } catch (error) {
    return errorResponse(
      error,
      "Internal server error while retrieving file content"
    );
  }
}
