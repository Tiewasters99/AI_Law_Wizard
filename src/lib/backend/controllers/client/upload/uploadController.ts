// Controller for client upload API endpoints

import { NextRequest } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import { deleteClientFile } from "../../../services/client/upload/uploadService";
import { processClientBatchFiles } from "../../../services/client/embedding/embeddingService";
import { successResponse, errorResponse } from "../../../utils/response";
import { ValidationError } from "../../../utils/errors";

/**
 * Handle POST request - Upload files and create embedding jobs
 */
export async function handleUploadFiles(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    if (!userId) {
      return errorResponse(
        new ValidationError("User ID is required"),
        "User ID is required"
      );
    }

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

    // Process files and create embedding jobs
    const result = await processClientBatchFiles(
      files,
      userId,
      oneDriveMetadata
    );

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
    return errorResponse(error, "Failed to upload files");
  }
}

/**
 * Handle DELETE request - Delete file
 */
export async function handleDeleteFile(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const body = await request.json();
    const { url } = body;

    await deleteClientFile(userId, url);

    return successResponse({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    return errorResponse(error, "Failed to delete file");
  }
}
