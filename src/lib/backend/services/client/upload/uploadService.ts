// Service for client file upload functionality

import { put } from "@vercel/blob";
import { ValidationError } from "../../../utils/errors";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

/**
 * Upload files for a client
 */
export async function uploadClientFiles(
  userId: string,
  files: File[]
): Promise<UploadedFile[]> {
  if (!files || files.length === 0) {
    throw new ValidationError("No files provided");
  }

  if (files.length > 5) {
    throw new ValidationError("Maximum 5 files allowed");
  }

  const uploadedFiles: UploadedFile[] = [];

  for (const file of files) {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(`File ${file.name} exceeds 10MB limit`);
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new ValidationError(`File type ${file.type} not allowed`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${userId}/${timestamp}-${randomString}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
      contentType: file.type,
    });

    uploadedFiles.push({
      name: file.name,
      url: blob.url,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    });
  }

  return uploadedFiles;
}

/**
 * Delete a file (verify ownership via URL)
 */
export async function deleteClientFile(userId: string, url: string) {
  // Verify the file belongs to the user (URL contains user ID)
  if (!url.includes(`/${userId}/`)) {
    throw new ValidationError("Access denied");
  }

  // Delete from Vercel Blob
  await fetch(url, { method: "DELETE" });

  return { success: true };
}
