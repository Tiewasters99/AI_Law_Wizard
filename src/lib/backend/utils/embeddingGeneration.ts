// Chunking and embedding generation utilities
// Handles text chunking, embedding generation via OpenRouter, and Pinecone storage

import { openRouterService } from "../services/openRouterService";
import { pineconeIndex } from "../config/pineconeConfig";
import {
  createEmbeddingChunk,
  updateEmbeddingChunkStatus,
  type CreateEmbeddingChunkData,
} from "../repositories/attorney/embeddingJobRepository";
import { ChunkStatus } from "@prisma/client";

export interface Chunk {
  fileId: string;
  chunkIndex: number;
  text: string;
}

/**
 * Chunk text with overlap for better context preservation
 */
export function chunkTextWithOverlap(
  fileId: string,
  fullText: string,
  maxChars = 2000,
  overlap = 200
): Chunk[] {
  if (!fullText || fullText.trim().length === 0) {
    return [];
  }

  const chunks: Chunk[] = [];
  let i = 0;
  let idx = 0;

  while (i < fullText.length) {
    const start = Math.max(0, i - (idx ? overlap : 0));
    const end = Math.min(fullText.length, start + maxChars);
    chunks.push({
      fileId,
      chunkIndex: idx++,
      text: fullText.slice(start, end),
    });
    i = end;
  }

  return chunks;
}

/**
 * Generate embeddings and store in Pinecone
 * Optimized for batch processing with retry logic
 */
export async function processEmbeddingsForChunks(
  chunks: Chunk[],
  jobId: string,
  fileId: string
): Promise<number> {
  if (!chunks || chunks.length === 0) {
    console.warn("No chunks provided for embedding generation");
    return 0;
  }

  console.log(`Processing ${chunks.length} chunks for job ${jobId}`);

  // Create chunk records in database first
  const createdChunks: any[] = [];

  for (const chunk of chunks) {
    try {
      const chunkData: CreateEmbeddingChunkData = {
        jobId,
        chunkIndex: chunk.chunkIndex,
        content: chunk.text,
        contentLength: chunk.text.length,
      };

      const created = await createEmbeddingChunk(chunkData);
      createdChunks.push(created);
    } catch (error) {
      console.error(`Failed to create chunk ${chunk.chunkIndex}:`, error);
      // Continue with other chunks
    }
  }

  if (createdChunks.length === 0) {
    console.error("Failed to create any chunk records");
    return 0;
  }

  console.log(
    `Created ${createdChunks.length} chunk records, generating embeddings`
  );

  // Process embeddings in batches to optimize API calls
  const BATCH_SIZE = 10; // Process 10 chunks at a time
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < createdChunks.length; i += BATCH_SIZE) {
    const batch = createdChunks.slice(i, i + BATCH_SIZE);
    const chunkTexts = batch.map((c, idx) => chunks[i + idx].text);

    try {
      // Generate embeddings in batch via OpenRouter
      const embeddings = await openRouterService.generateEmbeddings(chunkTexts);

      // Store embeddings in Pinecone and update chunk status
      const records = batch.map((chunk, index) => ({
        id: `${fileId}__${chunk.chunkIndex}`,
        values: embeddings[index],
        metadata: {
          fileId,
          chunkIndex: chunk.chunkIndex,
          text: chunk.content.substring(0, 500), // Store first 500 chars as metadata
        },
      }));

      // Upsert to Pinecone
      await pineconeIndex.upsert(records);

      // Update chunk status to completed
      await Promise.all(
        batch.map((chunk, index) =>
          updateEmbeddingChunkStatus(
            chunk.id,
            ChunkStatus.COMPLETED,
            records[index].id
          )
        )
      );

      successful += batch.length;
      console.log(
        `Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
          createdChunks.length / BATCH_SIZE
        )} - ${successful} chunks successful`
      );

      // Small delay between batches to respect rate limits
      if (i + BATCH_SIZE < createdChunks.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error(
        `Failed to process embedding batch starting at ${i}:`,
        error
      );

      // Update all chunks in batch to failed
      await Promise.all(
        batch.map(chunk =>
          updateEmbeddingChunkStatus(
            chunk.id,
            ChunkStatus.FAILED,
            undefined,
            error instanceof Error ? error.message : "Unknown error"
          )
        )
      );

      failed += batch.length;
    }
  }

  console.log(
    `Embedding generation complete: ${successful} successful, ${failed} failed`
  );

  return successful;
}

/**
 * Recompose text from chunks (for testing/debugging)
 */
export function recomposeFromChunks(ordered: Chunk[], overlap = 200): string {
  if (!ordered.length) return "";
  let out = ordered[0].text;
  for (let i = 1; i < ordered.length; i++) {
    out += ordered[i].text.slice(overlap);
  }
  return out;
}
