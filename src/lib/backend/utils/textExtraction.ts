// Text extraction utilities for various file types
// Supports PDF, DOCX, images with OCR, and plain text files

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { createWorker } from "tesseract.js";
import mammoth from "mammoth";

// Allowed file types for processing
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-word.document.12",
  "application/vnd.ms-word.document.macroEnabled.12",
  "application/vnd.ms-word.template.12",
  "application/vnd.ms-word.template.macroEnabled.12",
  "text/plain",
  "text/rtf",
  "application/vnd.oasis.opendocument.text",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/json",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// Tesseract.js configuration for Next.js environment
const tesseractConfig = {
  logger: (m: unknown) => console.log(m),
  workerPath: undefined, // Let Tesseract.js find its own worker
  langPath: undefined, // Let Tesseract.js find its own language data
  corePath: undefined, // Let Tesseract.js find its own core
};

/**
 * Extract text content from various file types
 * @param file - The file to extract text from
 * @param buffer - Optional buffer if already converted
 * @returns Extracted text content
 */
export async function extractTextContent(
  file: File,
  buffer?: Buffer
): Promise<string> {
  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  // Check file size (50MB limit)
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("File too large. Maximum size is 50MB.");
  }

  // Convert file to buffer if not provided
  let fileBuffer: Buffer;
  if (buffer) {
    fileBuffer = buffer;
  } else {
    const bytes = await file.arrayBuffer();
    fileBuffer = Buffer.from(bytes);
  }

  try {
    if (file.type === "application/pdf") {
      return await extractTextFromPDF(file, fileBuffer);
    } else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/vnd.ms-word.document.12" ||
      file.type === "application/vnd.ms-word.document.macroEnabled.12" ||
      file.type === "application/vnd.ms-word.template.12" ||
      file.type === "application/vnd.ms-word.template.macroEnabled.12"
    ) {
      return await extractTextFromDOCX(fileBuffer);
    } else if (file.type === "application/msword") {
      return await extractTextFromDOC(fileBuffer);
    } else if (
      file.type.startsWith("text/") ||
      file.type === "text/rtf" ||
      file.type === "text/csv"
    ) {
      return await extractTextFromPlainText(fileBuffer);
    } else if (file.type === "application/json") {
      return await extractTextFromJSON(fileBuffer);
    } else if (file.type.startsWith("image/")) {
      return await extractTextFromImage(fileBuffer);
    } else {
      // For other binary files, return metadata
      return `File: ${file.name} (${file.type})`;
    }
  } catch (error) {
    console.error(`Error processing file ${file.name}:`, error);
    return `File: ${file.name} (${file.type}) - Processing failed: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
  }
}

/**
 * Extract text from PDF files with OCR fallback
 */
async function extractTextFromPDF(file: File, buffer: Buffer): Promise<string> {
  try {
    // First try with PDFLoader (LangChain)
    const loader = new PDFLoader(file);
    const docs = await loader.load();
    let textContent = docs.map(doc => doc.pageContent).join("\n\n");

    // If no text extracted, try with Tesseract OCR
    if (!textContent || textContent.trim().length < 100) {
      console.log(
        `PDFLoader extracted minimal text, trying Tesseract OCR for ${file.name}`
      );
      const worker = await createWorker("eng", undefined, tesseractConfig);
      const result = await worker.recognize(buffer);
      await worker.terminate();
      textContent = result.data.text;
    }

    console.log(
      `PDF processing completed for ${file.name}, extracted ${textContent.length} characters`
    );
    return textContent;
  } catch (error) {
    console.warn(
      `PDF processing failed for ${file.name}, trying Tesseract OCR:`,
      error
    );
    // Fallback to Tesseract OCR
    const worker = await createWorker("eng", undefined, tesseractConfig);
    const result = await worker.recognize(buffer);
    await worker.terminate();
    console.log(
      `Tesseract OCR completed for ${file.name}, extracted ${result.data.text.length} characters`
    );
    return result.data.text;
  }
}

/**
 * Extract text from DOCX files using mammoth
 */
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  console.log(`Processing Word document with mammoth`);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Extract text from DOC files using mammoth
 */
async function extractTextFromDOC(buffer: Buffer): Promise<string> {
  console.log(`Processing .doc file with mammoth`);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Extract text from plain text files
 */
async function extractTextFromPlainText(buffer: Buffer): Promise<string> {
  console.log(`Processing text file`);
  return buffer.toString("utf-8");
}

/**
 * Extract text from JSON files
 */
async function extractTextFromJSON(buffer: Buffer): Promise<string> {
  console.log(`Processing JSON file`);
  try {
    const jsonContent = JSON.parse(buffer.toString("utf-8"));
    // Convert JSON to readable text
    return JSON.stringify(jsonContent, null, 2);
  } catch (error) {
    return buffer.toString("utf-8");
  }
}

/**
 * Extract text from images using Tesseract OCR
 */
async function extractTextFromImage(buffer: Buffer): Promise<string> {
  console.log(`Processing image with OCR`);
  const worker = await createWorker("eng", undefined, tesseractConfig);
  const result = await worker.recognize(buffer);
  await worker.terminate();
  console.log(`OCR completed, extracted ${result.data.text.length} characters`);
  return result.data.text;
}
