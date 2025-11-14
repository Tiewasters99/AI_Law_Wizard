// Service for client embedding file processing
// Handles file upload, text extraction, chunking, and embedding generation

import { put } from "@vercel/blob";
import { extractTextContent } from "../../../utils/textExtraction";
import {
  chunkTextWithOverlap,
  processEmbeddingsForChunks,
} from "../../../utils/embeddingGeneration";
import {
  createEmbeddingJob,
  updateEmbeddingJobStatus,
  updateEmbeddingJobProgress,
  findEmbeddingJobByOneDriveIdAndUserId,
  type CreateEmbeddingJobData,
} from "../../../repositories/client/embeddingJobRepository";
import { findUserById } from "../../../repositories/common/userRepository";
import { getUserNamespace } from "../../../config/pineconeConfig";
import { ValidationError } from "../../../utils/errors";
import { JobStatus } from "@prisma/client";

// Configuration constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB total
const MAX_FILES = 20;
const PROCESSING_BATCH_SIZE = 3; // Process files in batches of 3

export interface OneDriveMetadata {
  oneDriveId?: string;
  oneDriveLastModified?: string;
}

export interface ProcessedFile {
  id: string;
  originalName: string;
  fileName: string;
  size: number;
  type: string;
  url: string;
  chunks: number;
  processedChunks: number;
  failedChunks: number;
  status: string;
  uploadedAt: string;
}

/**
 * Process a single file upload for client
 */
export async function processClientFileUpload(
  file: File,
  userId: string,
  oneDriveMetadata?: OneDriveMetadata
): Promise<ProcessedFile> {
  try {
    // Validate file
    if (!file.name || typeof file.name !== "string") {
      throw new ValidationError("File must have a valid name");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(
        `File ${file.name} is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      );
    }

    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const isOneDriveFile = !!oneDriveMetadata?.oneDriveId;

    // Check if OneDrive file already processed
    if (isOneDriveFile && oneDriveMetadata.oneDriveId) {
      const existingJob = await findEmbeddingJobByOneDriveIdAndUserId(
        oneDriveMetadata.oneDriveId,
        userId
      );
      if (existingJob) {
        console.log(
          `OneDrive file already processed: ${file.name} (${existingJob.id})`
        );
        return {
          id: existingJob.id,
          originalName: existingJob.originalName,
          fileName: existingJob.fileName,
          size: existingJob.fileSize,
          type: existingJob.fileType,
          url: existingJob.filePath || "",
          chunks: existingJob.totalChunks,
          processedChunks: existingJob.processedChunks,
          failedChunks: existingJob.failedChunks,
          status: existingJob.status,
          uploadedAt: existingJob.createdAt.toISOString(),
        };
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop() || "txt";
    const fileName = `${userId}/${timestamp}-${randomId}.${fileExtension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Vercel Blob storage
    const { url } = await put(fileName, buffer, {
      access: "public",
      addRandomSuffix: false,
    });

    // Create embedding job with userId
    const jobData: CreateEmbeddingJobData = {
      fileName,
      originalName: file.name,
      fileType: file.type,
      fileSize: file.size,
      filePath: url,
      userId,
      isOneDriveFile,
      oneDriveId: oneDriveMetadata?.oneDriveId,
      oneDriveLastModified: oneDriveMetadata?.oneDriveLastModified,
    };

    const job = await createEmbeddingJob(jobData);

    // Update status to processing
    await updateEmbeddingJobStatus(job.id, userId, JobStatus.PROCESSING);

    // Extract text content with timeout protection
    console.log(`Processing file: ${file.name}`);
    const textContent = await Promise.race([
      extractTextContent(file, buffer),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("Text extraction timeout")), 300000)
      ),
    ]);

    if (!textContent || textContent.trim().length === 0) {
      throw new Error("No text content extracted from file");
    }

    // Chunk text with adaptive sizing
    const isLargeFile = file.size > 10 * 1024 * 1024; // 10MB threshold
    const chunkSize = isLargeFile ? 2000 : 1000;
    const overlap = isLargeFile ? 400 : 200;

    const chunks = chunkTextWithOverlap(
      fileName,
      textContent,
      chunkSize,
      overlap
    );

    if (chunks.length === 0) {
      throw new Error("No chunks created from file content");
    }

    // Get user email and generate namespace
    const user = await findUserById(userId);
    if (!user) {
      throw new ValidationError("User not found");
    }
    const namespace = getUserNamespace(userId, user.email);

    // Generate embeddings and store in Pinecone with user namespace
    const successfulChunks = await processEmbeddingsForChunks(
      chunks,
      job.id,
      fileName,
      namespace
    );

    // Update job progress
    await updateEmbeddingJobProgress(
      job.id,
      userId,
      chunks.length,
      successfulChunks,
      chunks.length - successfulChunks
    );

    // Update job status
    if (successfulChunks > 0) {
      await updateEmbeddingJobStatus(job.id, userId, JobStatus.COMPLETED);
    } else {
      await updateEmbeddingJobStatus(
        job.id,
        userId,
        JobStatus.FAILED,
        "No chunks processed successfully"
      );
    }

    console.log(
      `File processed successfully: ${file.name} (${successfulChunks} chunks)`
    );

    return {
      id: job.id,
      originalName: job.originalName,
      fileName: job.fileName,
      size: job.fileSize,
      type: job.fileType,
      url: job.filePath || "",
      chunks: chunks.length,
      processedChunks: successfulChunks,
      failedChunks: chunks.length - successfulChunks,
      status: successfulChunks > 0 ? "COMPLETED" : "FAILED",
      uploadedAt: job.createdAt.toISOString(),
    };
  } catch (error) {
    console.error(`Error processing file ${file.name}:`, error);
    return {
      originalName: file.name,
      error: error instanceof Error ? error.message : "Unknown error",
      status: "failed",
    } as any;
  }
}

/**
 * Process multiple files in batch for client
 */
export async function processClientBatchFiles(
  files: File[],
  userId: string,
  oneDriveMetadata?: OneDriveMetadata
): Promise<{
  successfulFiles: ProcessedFile[];
  failedFiles: Array<{ fileName: string; error: string }>;
}> {
  if (!userId) {
    throw new ValidationError("User ID is required");
  }

  // Validate batch size
  if (files.length > MAX_FILES) {
    throw new ValidationError(
      `Too many files. Maximum allowed is ${MAX_FILES}`
    );
  }

  // Validate total size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > MAX_TOTAL_SIZE) {
    throw new ValidationError(
      `Total file size too large. Maximum allowed is ${MAX_TOTAL_SIZE / (1024 * 1024)}MB`
    );
  }

  console.log(
    `Processing ${files.length} files for user ${userId} (${(totalSize / (1024 * 1024)).toFixed(2)}MB total)`
  );

  const successfulFiles: ProcessedFile[] = [];
  const failedFiles: Array<{ fileName: string; error: string }> = [];

  // Process files in batches to avoid overwhelming the system
  for (let i = 0; i < files.length; i += PROCESSING_BATCH_SIZE) {
    const batch = files.slice(i, i + PROCESSING_BATCH_SIZE);

    console.log(
      `Processing batch ${Math.floor(i / PROCESSING_BATCH_SIZE) + 1}/${Math.ceil(
        files.length / PROCESSING_BATCH_SIZE
      )}`
    );

    // Process batch in parallel
    const results = await Promise.allSettled(
      batch.map(file => processClientFileUpload(file, userId, oneDriveMetadata))
    );

    // Collect results
    results.forEach((result, index) => {
      if (result.status === "fulfilled" && !(result.value as any).error) {
        successfulFiles.push(result.value);
      } else {
        const error =
          result.status === "rejected"
            ? result.reason
            : (result.value as any).error;
        failedFiles.push({
          fileName: batch[index].name,
          error: error instanceof Error ? error.message : error,
        });
      }
    });

    // Small delay between batches to prevent overwhelming
    if (i + PROCESSING_BATCH_SIZE < files.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(
    `Batch processing complete: ${successfulFiles.length} successful, ${failedFiles.length} failed`
  );

  return {
    successfulFiles,
    failedFiles,
  };
}
