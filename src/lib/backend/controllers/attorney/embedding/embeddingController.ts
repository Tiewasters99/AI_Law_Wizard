// Controller for embedding API endpoints

import { NextRequest } from "next/server";
import { processBatchFiles } from "../../../services/attorney/embedding/embeddingService";
import { successResponse, errorResponse } from "../../../utils/response";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import { ValidationError } from "../../../utils/errors";

/**
 * Handle POST request - Upload and process files for embedding
 */
export async function handleFileUpload(
  request: NextRequest,
  userId: string | undefined
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    // Get FormData from request
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return errorResponse(
        new ValidationError("No files provided"),
        "No files provided"
      );
    }

    // Extract OneDrive metadata if present
    const oneDriveId = formData.get("oneDriveId") as string | null;
    const oneDriveLastModified = formData.get("oneDriveLastModified") as
      | string
      | null;

    const oneDriveMetadata = oneDriveId
      ? { oneDriveId, oneDriveLastModified: oneDriveLastModified || undefined }
      : undefined;

    // Process files
    const result = await processBatchFiles(files, oneDriveMetadata);

    // Return response
    return successResponse({
      success: true,
      files: result.successfulFiles,
      failedFiles: result.failedFiles,
      message: `${result.successfulFiles.length} file(s) processed successfully${
        result.failedFiles.length > 0
          ? `, ${result.failedFiles.length} failed`
          : ""
      }`,
      totalFiles: files.length,
    });
  } catch (error) {
    return errorResponse(error, "Failed to process files");
  }
}
