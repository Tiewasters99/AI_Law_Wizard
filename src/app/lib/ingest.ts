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
  const chunks = chunkTextWithOverlap(fileId, text, opts.maxChars, opts.overlap);

  // Create chunk records in database individually to get their IDs
  const createdChunks: EmbeddingChunk[] = [];
  for (const chunk of chunks) {
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

  await pineIndex.upsert(records);
  return chunks.length;
}