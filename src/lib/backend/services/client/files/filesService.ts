// Service for client files functionality

import {
  findAllEmbeddingJobsByUserId,
  findEmbeddingJobByIdAndUserId,
  deleteEmbeddingJobByIdAndUserId,
} from "../../../repositories/client/embeddingJobRepository";
import { NotFoundError, ValidationError } from "../../../utils/errors";

export interface FilesListOptions {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * List all files for a client with pagination and search
 */
export async function listClientFiles(
  userId: string,
  options: FilesListOptions
) {
  const { page = 1, limit = 10, search } = options;

  if (!userId) {
    throw new ValidationError("User ID is required");
  }

  const result = await findAllEmbeddingJobsByUserId(userId, {
    page,
    limit,
    search,
  });

  // Format files to match frontend expectations
  const files = result.jobs.map(job => ({
    id: job.id,
    fileName: job.fileName,
    originalName: job.originalName,
    size: job.fileSize,
    uploadedAt: job.createdAt.toISOString(),
    modifiedAt: job.updatedAt.toISOString(),
    path: job.filePath || "",
    status: job.status,
    oneDriveId: job.oneDriveId || undefined,
    isOneDriveFile: job.isOneDriveFile || false,
  }));

  return {
    success: true,
    files,
    pagination: {
      currentPage: result.pagination.page,
      totalPages: result.pagination.totalPages,
      totalCount: result.pagination.total,
      pageSize: result.pagination.limit,
    },
  };
}

/**
 * Get a single file by ID (ensures it belongs to the client)
 */
export async function getClientFile(id: string, userId: string) {
  if (!id) {
    throw new ValidationError("File ID is required");
  }

  if (!userId) {
    throw new ValidationError("User ID is required");
  }

  const file = await findEmbeddingJobByIdAndUserId(id, userId);

  if (!file) {
    throw new NotFoundError("File");
  }

  return {
    id: file.id,
    fileName: file.fileName,
    originalName: file.originalName,
    size: file.fileSize,
    uploadedAt: file.createdAt.toISOString(),
    modifiedAt: file.updatedAt.toISOString(),
    path: file.filePath || "",
    status: file.status,
    oneDriveId: file.oneDriveId || undefined,
    isOneDriveFile: file.isOneDriveFile || false,
  };
}

/**
 * Delete a file (ensures it belongs to the client)
 */
export async function deleteClientFile(id: string, userId: string) {
  if (!id) {
    throw new ValidationError("File ID is required");
  }

  if (!userId) {
    throw new ValidationError("User ID is required");
  }

  // Verify file exists and belongs to user
  const file = await findEmbeddingJobByIdAndUserId(id, userId);
  if (!file) {
    throw new NotFoundError("File");
  }

  await deleteEmbeddingJobByIdAndUserId(id, userId);
}

export interface FileDownloadResponse {
  url?: string;
  oneDriveId?: string;
  redirect: boolean;
}

/**
 * Get file download URL (ensures it belongs to the client)
 */
export async function downloadClientFile(
  id: string,
  userId: string
): Promise<FileDownloadResponse> {
  if (!id) {
    throw new ValidationError("File ID is required");
  }

  if (!userId) {
    throw new ValidationError("User ID is required");
  }

  const file = await findEmbeddingJobByIdAndUserId(id, userId);

  if (!file) {
    throw new NotFoundError("File");
  }

  // For locally stored files, return the file path for redirect
  if (file.filePath) {
    return {
      url: file.filePath,
      redirect: true,
    };
  }

  // For OneDrive files, return the OneDrive ID for frontend to handle
  if (file.isOneDriveFile && file.oneDriveId) {
    return {
      oneDriveId: file.oneDriveId,
      redirect: false,
    };
  }

  throw new NotFoundError("File download URL");
}
