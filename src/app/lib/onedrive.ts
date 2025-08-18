// OneDrive utility functions for common operations

export interface OneDriveFileInfo {
  id: string
  name: string
  size: number
  type: string
  isFolder: boolean
  downloadUrl?: string
  lastModified: string
  created: string
  childCount: number
}

export interface OneDriveUploadResponse {
  success: boolean
  file?: OneDriveFileInfo
  error?: string
}

export interface OneDriveDownloadResponse {
  success: boolean
  file?: {
    id: string
    name: string
    size: number
    type: string
    content: string // Base64 encoded
    downloadUrl: string
  }
  error?: string
}

// List files from OneDrive
export async function listOneDriveFiles(options: {
  folderId?: string
  pageSize?: number
  search?: string
  orderBy?: string
  filter?: string
} = {}): Promise<{ success: boolean; files?: OneDriveFileInfo[]; error?: string; total?: number }> {
  try {
    const params = new URLSearchParams()
    
    if (options.folderId) params.append('folderId', options.folderId)
    if (options.pageSize) params.append('pageSize', options.pageSize.toString())
    if (options.search) params.append('search', options.search)
    if (options.orderBy) params.append('orderBy', options.orderBy)
    if (options.filter) params.append('filter', options.filter)

    const response = await fetch(`/api/onedrive?${params.toString()}`)
    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to list files' }
    }

    return { success: true, files: data.files, total: data.total }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Download a file from OneDrive
export async function downloadOneDriveFile(fileId: string): Promise<OneDriveDownloadResponse> {
  try {
    const response = await fetch('/api/onedrive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to download file' }
    }

    return { success: true, file: data.file }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Upload a file to OneDrive
export async function uploadToOneDrive(file: File, folderId?: string): Promise<OneDriveUploadResponse> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    if (folderId) {
      formData.append('folderId', folderId)
    }

    const response = await fetch('/api/onedrive', {
      method: 'PUT',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to upload file' }
    }

    return { success: true, file: data.file }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Convert base64 content back to file
export function base64ToFile(base64Content: string, fileName: string, mimeType: string): File {
  const byteCharacters = atob(base64Content)
  const byteNumbers = new Array(byteCharacters.length)
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: mimeType })
  
  return new File([blob], fileName, { type: mimeType })
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get file icon based on file type
export function getFileIcon(fileType: string, isFolder: boolean): string {
  if (isFolder) return '📁'
  
  const iconMap: Record<string, string> = {
    'application/pdf': '📄',
    'text/plain': '📝',
    'application/msword': '📄',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📄',
    'application/vnd.ms-excel': '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
    'application/vnd.ms-powerpoint': '📊',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',
    'image/jpeg': '🖼️',
    'image/png': '🖼️',
    'image/gif': '🖼️',
    'video/mp4': '🎥',
    'audio/mpeg': '🎵',
  }
  
  return iconMap[fileType] || '📄'
}
