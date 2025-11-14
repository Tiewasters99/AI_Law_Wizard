// Repository for embedding job database operations

import { prisma } from "../../prisma";
import { JobStatus, ChunkStatus } from "@prisma/client";

export interface EmbeddingJob {
  id: string;
  status: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string | null;
  totalChunks: number;
  processedChunks: number;
  failedChunks: number;
  error: string | null;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  isOneDriveFile: boolean;
  oneDriveId: string | null;
  oneDriveLastModified: string | null;
}

export interface CreateEmbeddingJobData {
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  userId?: string;
  isOneDriveFile?: boolean;
  oneDriveId?: string;
  oneDriveLastModified?: string;
}

export interface CreateEmbeddingChunkData {
  jobId: string;
  chunkIndex: number;
  content: string;
  contentLength: number;
}

/**
 * Create new embedding job
 */
export async function createEmbeddingJob(
  data: CreateEmbeddingJobData
): Promise<EmbeddingJob> {
  return await prisma.embeddingJob.create({
    data: {
      fileName: data.fileName,
      originalName: data.originalName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      filePath: data.filePath,
      userId: data.userId || null,
      isOneDriveFile: data.isOneDriveFile || false,
      oneDriveId: data.oneDriveId,
      oneDriveLastModified: data.oneDriveLastModified,
      status: JobStatus.PENDING,
    },
  });
}

/**
 * Find embedding job by ID
 */
export async function findEmbeddingJobById(
  id: string
): Promise<EmbeddingJob | null> {
  return await prisma.embeddingJob.findUnique({
    where: { id },
  });
}

/**
 * Find embedding job by OneDrive ID
 */
export async function findEmbeddingJobByOneDriveId(
  oneDriveId: string
): Promise<EmbeddingJob | null> {
  return await prisma.embeddingJob.findUnique({
    where: { oneDriveId },
  });
}

/**
 * Update embedding job status
 */
export async function updateEmbeddingJobStatus(
  id: string,
  status: JobStatus,
  error?: string
): Promise<EmbeddingJob> {
  return await prisma.embeddingJob.update({
    where: { id },
    data: {
      status,
      error,
      updatedAt: new Date(),
      completedAt:
        status === JobStatus.COMPLETED || status === JobStatus.FAILED
          ? new Date()
          : undefined,
    },
  });
}

/**
 * Update embedding job progress
 */
export async function updateEmbeddingJobProgress(
  id: string,
  totalChunks: number,
  processedChunks: number,
  failedChunks: number
): Promise<EmbeddingJob> {
  return await prisma.embeddingJob.update({
    where: { id },
    data: {
      totalChunks,
      processedChunks,
      failedChunks,
      updatedAt: new Date(),
    },
  });
}

/**
 * Create embedding chunk
 */
export async function createEmbeddingChunk(data: CreateEmbeddingChunkData) {
  return await prisma.embeddingChunk.create({
    data: {
      jobId: data.jobId,
      chunkIndex: data.chunkIndex,
      content: data.content,
      contentLength: data.contentLength,
      status: ChunkStatus.PENDING,
    },
  });
}

/**
 * Update embedding chunk status
 */
export async function updateEmbeddingChunkStatus(
  id: string,
  status: ChunkStatus,
  embeddingId?: string,
  error?: string,
  summary?: string,
  metadata?: any
) {
  return await prisma.embeddingChunk.update({
    where: { id },
    data: {
      status,
      embeddingId,
      error,
      summary,
      metadata,
      processedAt: status === ChunkStatus.COMPLETED ? new Date() : undefined,
      updatedAt: new Date(),
    },
  });
}

/**
 * Find chunks by job ID
 */
export async function findEmbeddingChunksByJobId(jobId: string) {
  return await prisma.embeddingChunk.findMany({
    where: { jobId },
    orderBy: { chunkIndex: "asc" },
    select: {
      id: true,
      chunkIndex: true,
      content: true,
      status: true,
      embeddingId: true,
    },
  });
}

/**
 * Find all embedding jobs with pagination and search
 */
export async function findAllEmbeddingJobs(options: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { page = 1, limit = 10, search } = options;

  const skip = (page - 1) * limit;

  // Build where clause for search
  const where: any = {};
  if (search) {
    where.OR = [
      { originalName: { contains: search, mode: "insensitive" } },
      { fileName: { contains: search, mode: "insensitive" } },
    ];
  }

  const [jobs, total] = await Promise.all([
    prisma.embeddingJob.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.embeddingJob.count({ where }),
  ]);

  return {
    jobs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
