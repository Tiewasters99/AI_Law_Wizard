// Service for attorney files functionality

import {
  findAllEmbeddingJobs,
  findEmbeddingJobById,
} from "../../../repositories/attorney/embeddingJobRepository";
import { NotFoundError, ValidationError } from "../../../utils/errors";

export interface FilesListOptions {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * List all files with pagination and search
 */
export async function listFiles(options: FilesListOptions) {
  const { page = 1, limit = 10, search } = options;

  const result = await findAllEmbeddingJobs({
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

export interface FileDownloadResponse {
  url?: string;
  oneDriveId?: string;
  redirect: boolean;
}

/**
 * Get file download URL
 */
export async function downloadFile(id: string): Promise<FileDownloadResponse> {
  if (!id) {
    throw new ValidationError("File ID is required");
  }

  const file = await findEmbeddingJobById(id);

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
