import { openapi, pineIndex } from "./pineConfig";
import { chunkTextWithOverlap } from "./chunking";
import { prisma, ChunkStatus } from "../../lib/database";
import type { EmbeddingChunk } from "@prisma/client";
import { generateChunkSummary, generateChunkMetadata } from "./summaryService";

export async function ingestPlainText(
  fileId: string,
  text: string,
  jobId: string,
  opts = { maxChars: 2000, overlap: 200 }   
) {
  // Check if text is empty or too short
  if (!text || text.trim().length === 0) {
    console.warn(`No text content extracted for file ${fileId}`);
    return 0;
  }

  const chunks = chunkTextWithOverlap(fileId, text, opts.maxChars, opts.overlap);

  // Check if chunks were created
  if (!chunks || chunks.length === 0) {
    console.warn(`No chunks created for file ${fileId}`);
    return 0;
  }

  // Check if chunks already exist for this job
  const existingChunks = await prisma.embeddingChunk.findMany({
    where: { jobId },
    select: { chunkIndex: true, id: true }
  });
  
  const existingChunkIndices = new Set(existingChunks.map(c => c.chunkIndex));
  const existingChunkMap = new Map(existingChunks.map(c => [c.chunkIndex, c.id]));
  
  // Create chunk records in database individually to get their IDs
  const createdChunks: EmbeddingChunk[] = [];
  for (const chunk of chunks) {
    if (existingChunkIndices.has(chunk.chunkIndex)) {
      // Chunk already exists, use existing one
      const existingChunk = await prisma.embeddingChunk.findUnique({
        where: { id: existingChunkMap.get(chunk.chunkIndex)! }
      });
      if (existingChunk) {
        createdChunks.push(existingChunk);
        continue;
      }
    }
    
    try {
      const createdChunk = await prisma.embeddingChunk.create({
        data: {
          jobId,
          chunkIndex: chunk.chunkIndex,
          content: chunk.text,
          contentLength: chunk.text.length,
          status: ChunkStatus.PENDING,
        },
      });
      createdChunks.push(createdChunk);
    } catch (error) {
      // If chunk already exists, find and use it
      if (error instanceof Error && error.message.includes('Unique constraint failed')) {
        const existingChunk = await prisma.embeddingChunk.findFirst({
          where: {
            jobId,
            chunkIndex: chunk.chunkIndex
          }
        });
        if (existingChunk) {
          createdChunks.push(existingChunk);
        }
      } else {
        throw error;
      }
    }
  }

  // Process embeddings and update chunk status
  const values = await Promise.all(chunks.map(async (chunk, index) => {
    try {
      const embedding = await openapi.embedQuery(chunk.text);
      
      // Generate summary and metadata for the chunk
      let summary: string | null = null;
      let metadata: any = null;
      
      try {
        summary = await generateChunkSummary(chunk.text, {
          maxLength: 200,
          includeKeywords: true
        });
        metadata = await generateChunkMetadata(chunk.text, summary);
      } catch (summaryError) {
        console.warn(`Failed to generate summary for chunk ${chunk.chunkIndex}:`, summaryError);
        // Continue without summary if generation fails
      }
      
      // Update chunk status to completed with embedding ID, summary, and metadata
      await prisma.embeddingChunk.update({
        where: { id: createdChunks[index].id },
        data: {
          status: ChunkStatus.COMPLETED,
          embeddingId: `${fileId}__${chunk.chunkIndex}`,
          summary,
          metadata,
          processedAt: new Date(),
          updatedAt: new Date(),
        },
      });
      
      return embedding;
    } catch (error) {
      // Update chunk status to failed
      await prisma.embeddingChunk.update({
        where: { id: createdChunks[index].id },
        data: {
          status: ChunkStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error',
          updatedAt: new Date(),
        },
      });
      throw error;
    }
  }));

  const records = chunks.map((c, i) => ({
    id: `${fileId}__${c.chunkIndex}`,
    values: values[i],
    metadata: { fileId, chunkIndex: c.chunkIndex, text: c.text },
  }));

  // Only upsert if we have records
  if (records.length > 0) {
    await pineIndex.upsert(records);
  }
  
  return chunks.length;
}