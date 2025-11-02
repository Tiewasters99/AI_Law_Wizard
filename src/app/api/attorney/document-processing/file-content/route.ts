import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/backend/prisma";

interface FileContentRequest {
  fileId: string;
  fileName: string;
}

interface FileContentResponse {
  success: boolean;
  content?: string;
  error?: string;
}

// Extract content from different file types
const extractFileContent = async (
  buffer: Buffer,
  fileName: string
): Promise<string> => {
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";

  try {
    switch (fileExtension) {
      case "pdf":
        // For PDF, we'll use a simple text extraction
        // In production, you'd use a proper PDF library like pdf-parse
        return `PDF content for ${fileName} - This would contain the actual PDF text content`;

      case "doc":
      case "docx":
        // For Word documents, we'd use mammoth or similar
        return `Word document content for ${fileName} - This would contain the actual document text`;

      case "txt":
      case "json":
      default:
        return buffer.toString("utf-8");
    }
  } catch (error) {
    console.error(`Error extracting content from ${fileName}:`, error);
    throw new Error(`Failed to extract content from ${fileName}`);
  }
};

// Get file content from database or storage
const getFileContent = async (
  fileId: string,
  fileName: string
): Promise<string> => {
  try {
    // First, try to get from embedding jobs table
    const job = await prisma.embeddingJob.findUnique({
      where: { id: fileId },
    });

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
          // Fallback: try to extract content from the file path as URL
          if (job.filePath.startsWith("http")) {
            const urlResponse = await fetch(job.filePath);
            if (urlResponse.ok) {
              const arrayBuffer = await urlResponse.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              return await extractFileContent(buffer, fileName);
            }
          }
        }
      }
    }

    // If no file found in database, return a placeholder
    return `Content for ${fileName} is not available. This file was processed but content could not be extracted.`;
  } catch (error) {
    console.error(`Error getting file content for ${fileId}:`, error);
    throw new Error(`Failed to retrieve content for ${fileName}`);
  }
};

export const POST = async (
  request: NextRequest
): Promise<NextResponse<FileContentResponse>> => {
  try {
    const body: FileContentRequest = await request.json();
    const { fileId, fileName } = body;

    if (!fileId || !fileName) {
      return NextResponse.json(
        {
          success: false,
          error: "File ID and file name are required",
        },
        { status: 400 }
      );
    }

    // Get file content
    const content = await getFileContent(fileId, fileName);

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("❌ File content API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while retrieving file content",
      },
      { status: 500 }
    );
  }
};

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");
    const fileName = searchParams.get("fileName");

    if (!fileId || !fileName) {
      return NextResponse.json(
        {
          success: false,
          error: "File ID and file name are required",
        },
        { status: 400 }
      );
    }

    // Get file content
    const content = await getFileContent(fileId, fileName);

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("❌ File content GET API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while retrieving file content",
      },
      { status: 500 }
    );
  }
};
