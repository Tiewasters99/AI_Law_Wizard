// Controller for client OneDrive file operations API endpoints

import { NextRequest } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import {
  listClientOneDriveFiles,
  downloadClientOneDriveFile,
} from "../../../services/client/onedrive/onedriveService";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateRequired } from "../../../utils/validation";

/**
 * Handle GET request - List OneDrive files
 */
export async function handleListClientOneDriveFiles(
  request: NextRequest,
  userId: string | undefined
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId") || "root";
    const pageSize = parseInt(searchParams.get("pageSize") || "100");
    const search = searchParams.get("search");
    const orderBy = searchParams.get("orderBy") || "name";

    const result = await listClientOneDriveFiles(request.cookies, folderId, {
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
export async function handleDownloadClientOneDriveFile(
  request: NextRequest,
  userId: string | undefined
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    const body = await request.json();
    const { fileId } = body;

    validateRequired(fileId, "File ID");

    const result = await downloadClientOneDriveFile(request.cookies, fileId);

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

