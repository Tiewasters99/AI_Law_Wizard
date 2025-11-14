// Repository for client embedding job database operations

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
  userId: string;
  isOneDriveFile?: boolean;
  oneDriveId?: string;
  oneDriveLastModified?: string;
}

/**
 * Create new embedding job for client
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
      userId: data.userId,
      isOneDriveFile: data.isOneDriveFile || false,
      oneDriveId: data.oneDriveId,
      oneDriveLastModified: data.oneDriveLastModified,
      status: JobStatus.PENDING,
    },
  });
}

/**
 * Find embedding job by ID and userId (ensures client can only access their files)
 */
export async function findEmbeddingJobByIdAndUserId(
  id: string,
  userId: string
): Promise<EmbeddingJob | null> {
  return await prisma.embeddingJob.findFirst({
    where: {
      id,
      userId,
    },
  });
}

/**
 * Find all embedding jobs for a specific user with pagination and search
 */
export async function findAllEmbeddingJobsByUserId(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
  }
) {
  const { page = 1, limit = 10, search } = options;

  const skip = (page - 1) * limit;

  // Build where clause for search and userId
  const where: any = {
    userId,
  };

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

/**
 * Find embedding job by OneDrive ID and userId
 */
export async function findEmbeddingJobByOneDriveIdAndUserId(
  oneDriveId: string,
  userId: string
): Promise<EmbeddingJob | null> {
  return await prisma.embeddingJob.findFirst({
    where: {
      oneDriveId,
      userId,
    },
  });
}

/**
 * Delete embedding job by ID and userId
 */
export async function deleteEmbeddingJobByIdAndUserId(
  id: string,
  userId: string
): Promise<void> {
  await prisma.embeddingJob.deleteMany({
    where: {
      id,
      userId,
    },
  });
}

/**
 * Update embedding job status
 */
export async function updateEmbeddingJobStatus(
  id: string,
  userId: string,
  status: JobStatus,
  error?: string
): Promise<EmbeddingJob> {
  return await prisma.embeddingJob
    .updateMany({
      where: {
        id,
        userId,
      },
      data: {
        status,
        error,
        updatedAt: new Date(),
        completedAt:
          status === JobStatus.COMPLETED || status === JobStatus.FAILED
            ? new Date()
            : undefined,
      },
    })
    .then(async () => {
      const job = await prisma.embeddingJob.findFirst({
        where: { id, userId },
      });
      if (!job) {
        throw new Error("Job not found after update");
      }
      return job as EmbeddingJob;
    });
}

/**
 * Update embedding job progress
 */
export async function updateEmbeddingJobProgress(
  id: string,
  userId: string,
  totalChunks: number,
  processedChunks: number,
  failedChunks: number
): Promise<EmbeddingJob> {
  await prisma.embeddingJob.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      totalChunks,
      processedChunks,
      failedChunks,
      updatedAt: new Date(),
    },
  });

  const job = await prisma.embeddingJob.findFirst({
    where: { id, userId },
  });
  if (!job) {
    throw new Error("Job not found after update");
  }
  return job as EmbeddingJob;
}

/**
 * Find embedding chunks by job ID
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
 * Find all completed embedding jobs for a user
 */
export async function findCompletedEmbeddingJobsByUserId(
  userId: string
): Promise<EmbeddingJob[]> {
  return (await prisma.embeddingJob.findMany({
    where: {
      userId,
      status: JobStatus.COMPLETED,
    },
    orderBy: { createdAt: "desc" },
  })) as EmbeddingJob[];
}
