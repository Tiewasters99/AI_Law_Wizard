// Repository for embedding job database operations

import { prisma } from "../../prisma";

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

