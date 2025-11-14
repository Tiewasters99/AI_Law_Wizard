// OneDrive utility functions for frontend

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileIcon(fileType: string, isFolder: boolean): string {
  if (isFolder) return "📁";

  const iconMap: Record<string, string> = {
    "application/pdf": "📄",
    "text/plain": "📝",
    "application/msword": "📄",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "📄",
    "application/vnd.ms-excel": "📊",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "📊",
    "application/vnd.ms-powerpoint": "📊",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "📊",
    "image/jpeg": "🖼️",
    "image/png": "🖼️",
    "image/gif": "🖼️",
    "video/mp4": "🎥",
    "audio/mpeg": "🎵",
  };

  return iconMap[fileType] || "📄";
}

export function base64ToFile(
  base64Content: string,
  fileName: string,
  mimeType: string
): File {
  const byteCharacters = atob(base64Content);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  return new File([blob], fileName, { type: mimeType });
}
