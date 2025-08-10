import { PrismaClient } from '../generated/prisma';
import { JobStatus, ChunkStatus } from '../generated/prisma';

const prisma = new PrismaClient();

export interface CreateEmbeddingJobData {
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
}

export interface CreateChunkData {
  jobId: string;
  chunkIndex: number;
  content: string;
  contentLength: number;
}

// Create a new embedding job
export async function createEmbeddingJob(data: CreateEmbeddingJobData) {
  return await prisma.embeddingJob.create({
    data: {
      fileName: data.fileName,
      originalName: data.originalName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      filePath: data.filePath,
      status: JobStatus.PENDING,
    },
  });
}

// Update job status
export async function updateJobStatus(jobId: string, status: JobStatus, error?: string) {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (status === JobStatus.COMPLETED) {
    updateData.completedAt = new Date();
  }

  if (error) {
    updateData.error = error;
  }

  return await prisma.embeddingJob.update({
    where: { id: jobId },
    data: updateData,
  });
}

// Update job progress
export async function updateJobProgress(jobId: string, totalChunks: number, processedChunks: number, failedChunks: number = 0) {
  return await prisma.embeddingJob.update({
    where: { id: jobId },
    data: {
      totalChunks,
      processedChunks,
      failedChunks,
      updatedAt: new Date(),
    },
  });
}

// Create chunks for a job
export async function createChunks(jobId: string, chunks: CreateChunkData[]) {
  const chunkData = chunks.map(chunk => ({
    jobId,
    chunkIndex: chunk.chunkIndex,
    content: chunk.content,
    contentLength: chunk.contentLength,
    status: ChunkStatus.PENDING,
  }));

  return await prisma.embeddingChunk.createMany({
    data: chunkData,
  });
}

// Update chunk status
export async function updateChunkStatus(chunkId: string, status: ChunkStatus, embeddingId?: string, error?: string) {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (status === ChunkStatus.COMPLETED) {
    updateData.processedAt = new Date();
    if (embeddingId) {
      updateData.embeddingId = embeddingId;
    }
  }

  if (error) {
    updateData.error = error;
  }

  return await prisma.embeddingChunk.update({
    where: { id: chunkId },
    data: updateData,
  });
}

// Get job with chunks
export async function getJobWithChunks(jobId: string) {
  return await prisma.embeddingJob.findUnique({
    where: { id: jobId },
    include: {
      chunks: {
        orderBy: { chunkIndex: 'asc' },
      },
    },
  });
}

// Get all jobs for a user
export async function getUserJobs(userId: string) {
  return await prisma.embeddingJob.findMany({
    include: {
      chunks: {
        orderBy: { chunkIndex: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Get all jobs (for admin)
export async function getAllJobs() {
  return await prisma.embeddingJob.findMany({
    include: {
      chunks: {
        orderBy: { chunkIndex: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Get job statistics
export async function getJobStats() {
  const stats = await prisma.embeddingJob.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  });

  const totalJobs = await prisma.embeddingJob.count();
  const totalChunks = await prisma.embeddingChunk.count();
  const completedChunks = await prisma.embeddingChunk.count({
    where: { status: ChunkStatus.COMPLETED },
  });

  return {
    totalJobs,
    totalChunks,
    completedChunks,
    statusBreakdown: stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>),
  };
}

// Delete job and all related chunks
export async function deleteJob(jobId: string) {
  return await prisma.embeddingJob.delete({
    where: { id: jobId },
  });
}

export { prisma, JobStatus, ChunkStatus };
