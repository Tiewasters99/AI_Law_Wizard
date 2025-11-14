// Controller for client files API endpoint

import { NextRequest, NextResponse } from "next/server";
import {
  listClientFiles,
  getClientFile,
  deleteClientFile,
  downloadClientFile,
} from "../../../services/client/files/filesService";
import { successResponse, errorResponse } from "../../../utils/response";
import { verifyClientAccess } from "../../../utils/clientAuth";

/**
 * Handle GET request - List files
 */
export async function handleListFiles(
  request: NextRequest,
  userId: string | undefined
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");

    const result = await listClientFiles(userId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search: search || undefined,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error, "Failed to fetch files");
  }
}

/**
 * Handle GET request - Get single file
 */
export async function handleGetFile(
  request: NextRequest,
  userId: string | undefined,
  fileId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const file = await getClientFile(fileId, userId);

    return successResponse({ file });
  } catch (error) {
    return errorResponse(error, "Failed to fetch file");
  }
}

/**
 * Handle DELETE request - Delete file
 */
export async function handleDeleteFile(
  request: NextRequest,
  userId: string | undefined,
  fileId: string
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    await deleteClientFile(fileId, userId);

    return successResponse({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    return errorResponse(error, "Failed to delete file");
  }
}

/**
 * Handle GET request - Download file
 */
export async function handleDownloadFile(
  request: NextRequest,
  userId: string | undefined
): Promise<Response> {
  try {
    await verifyClientAccess(userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    const result = await downloadClientFile(fileId, userId);

    // If redirect is true, redirect to the URL
    if (result.redirect && result.url) {
      return NextResponse.redirect(result.url);
    }

    // For OneDrive files, return the OneDrive ID
    if (result.oneDriveId) {
      return successResponse({
        oneDriveId: result.oneDriveId,
      });
    }

    return errorResponse(
      new Error("Invalid download response"),
      "Failed to download file"
    );
  } catch (error) {
    return errorResponse(error, "Failed to download file");
  }
}
