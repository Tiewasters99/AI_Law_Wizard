export interface OneDriveFileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  isFolder: boolean;
  downloadUrl?: string;
  lastModified: string;
  created: string;
  childCount: number;
  isSynced?: boolean;
  isSelected?: boolean;
}

export interface OneDriveUploadResponse {
  success: boolean;
  file?: OneDriveFileInfo;
  error?: string;
}

export interface OneDriveDownloadResponse {
  success: boolean;
  file?: {
    id: string;
    name: string;
    size: number;
    type: string;
    content: string; // Base64 encoded
    downloadUrl: string;
  };
  error?: string;
}

export interface OneDriveAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}
