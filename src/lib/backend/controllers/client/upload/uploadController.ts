// Controller for client upload API endpoints

import { NextRequest } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import {
  uploadClientFiles,
  deleteClientFile,
} from "../../../services/client/upload/uploadService";
import { successResponse, errorResponse } from "../../../utils/response";

/**
 * Handle POST request - Upload files
 */
export async function handleUploadFiles(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    const uploadedFiles = await uploadClientFiles(userId, files);

    return successResponse({
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
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

