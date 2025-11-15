// Service for OneDrive file operations

import { OneDriveService as OneDriveServiceClass } from "../../onedriveService";

export interface ListFilesOptions {
  pageSize?: number;
  search?: string;
  orderBy?: string;
}

export interface OneDriveListResponse {
  files: any[];
  total: number;
}

export interface OneDriveDownloadResponse {
  success: boolean;
  file?: any;
  error?: string;
}

/**
 * List OneDrive files
 */
export async function listOneDriveFiles(
  cookies: any,
  folderId: string = "root",
  options: ListFilesOptions = {}
): Promise<OneDriveListResponse> {
  const oneDriveService = new OneDriveServiceClass(cookies);
  const result = await oneDriveService.listFiles(folderId, {
    pageSize: options.pageSize || 100,
    search: options.search,
    orderBy: options.orderBy || "name",
  });

  if (!result.success) {
    throw new Error(result.error || "Failed to list files");
  }

  return {
    files: result.files || [],
    total: result.total || 0,
  };
}

/**
 * Download OneDrive file
 */
export async function downloadOneDriveFile(
  cookies: any,
  fileId: string
): Promise<OneDriveDownloadResponse> {
  const oneDriveService = new OneDriveServiceClass(cookies);
  const result = await oneDriveService.downloadFile(fileId);

  if (!result.success) {
    return {
      success: false,
      error: result.error || "Failed to download file",
    };
  }

  return {
    success: true,
    file: result.file,
  };
}
