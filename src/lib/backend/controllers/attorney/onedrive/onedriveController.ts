// Controller for OneDrive file operations API endpoints

import { NextRequest } from "next/server";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import {
  listOneDriveFiles,
  downloadOneDriveFile,
} from "../../../services/attorney/onedrive/onedriveService";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateRequired } from "../../../utils/validation";

/**
 * Handle GET request - List OneDrive files
 */
export async function handleListOneDriveFiles(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId") || "root";
    const pageSize = parseInt(searchParams.get("pageSize") || "100");
    const search = searchParams.get("search");
    const orderBy = searchParams.get("orderBy") || "name";

    const result = await listOneDriveFiles(request.cookies, folderId, {
      pageSize,
      search: search || undefined,
      orderBy,
    });

    return successResponse({
      files: result.files,
      total: result.total,
    });
  } catch (error) {
    return errorResponse(error, "Failed to list files");
  }
}

/**
 * Handle POST request - Download OneDrive file
 */
export async function handleDownloadOneDriveFile(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    const body = await request.json();
    const { fileId } = body;

    validateRequired(fileId, "File ID");

    const result = await downloadOneDriveFile(request.cookies, fileId);

    if (!result.success) {
      return errorResponse(
        new Error(result.error),
        result.error || "Failed to download file"
      );
    }

    return successResponse({ file: result.file });
  } catch (error) {
    return errorResponse(error, "Failed to download file");
  }
}
