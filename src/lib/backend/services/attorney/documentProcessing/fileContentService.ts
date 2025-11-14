// Service for file content extraction

import { findEmbeddingJobById } from "../../../repositories/attorney/embeddingJobRepository";

/**
 * Extract content from different file types
 */
async function extractFileContent(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";

  switch (fileExtension) {
    case "pdf":
      return `PDF content for ${fileName} - This would contain the actual PDF text content`;
    case "doc":
    case "docx":
      return `Word document content for ${fileName} - This would contain the actual document text`;
    case "txt":
    case "json":
    default:
      return buffer.toString("utf-8");
  }
}

/**
 * Get file content from database or storage
 */
export async function getFileContent(
  fileId: string,
  fileName: string
): Promise<string> {
  // Try to get from embedding jobs table
  const job = await findEmbeddingJobById(fileId);

  if (job && job.filePath) {
    // If it's a blob URL, fetch the content
    if (job.filePath.startsWith("https://")) {
      const response = await fetch(job.filePath);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return await extractFileContent(buffer, fileName);
      }
    } else {
      // If it's a local file path, read it directly
      try {
        const fs = await import("fs/promises");
        const fileBuffer = await fs.readFile(job.filePath);
        return await extractFileContent(fileBuffer, fileName);
      } catch (fsError) {
        console.warn(`Failed to read local file ${job.filePath}:`, fsError);
      }
    }
  }

  // If no file found, return a placeholder
  return `Content for ${fileName} is not available. This file was processed but content could not be extracted.`;
}

