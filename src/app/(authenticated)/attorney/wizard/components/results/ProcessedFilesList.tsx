"use client";

import { FileText, Download, Database, Hash, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProcessedFileInfo {
  fileId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  downloadUrl?: string;
  fileType?: string;
  jobId?: string;
  totalChunks?: number;
  processedChunks?: number;
  isOneDriveFile?: boolean;
  oneDriveId?: string | null;
}

interface ProcessedFilesListProps {
  processedFiles: ProcessedFileInfo[];
  title?: string;
}

export const ProcessedFilesList: React.FC<ProcessedFilesListProps> = ({
  processedFiles,
  title = "Processed Files",
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = async (file: ProcessedFileInfo) => {
    if (file.downloadUrl && file.downloadUrl !== "") {
      window.open(file.downloadUrl, "_blank");
    } else {
      console.log("Download not available for this file");
    }
  };

  if (processedFiles.length === 0) {
    return null;
  }

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-primary" />
          <span className="text-foreground">{title}</span>
          <Badge
            variant="secondary"
            className="bg-accent text-accent-foreground font-semibold"
          >
            {processedFiles.length}{" "}
            {processedFiles.length === 1 ? "file" : "files"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {processedFiles.map((file, index) => (
            <div
              key={file.fileId || index}
              className="p-4 rounded-lg transition-all duration-200 hover:translate-y-[-2px] bg-muted"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {file.originalName || file.fileName}
                      </h4>
                      {file.fileType && (
                        <Badge variant="outline" className="text-xs">
                          {file.fileType.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Hash className="w-3 h-3" />
                        <span>{formatFileSize(file.fileSize)}</span>
                      </span>
                      {file.totalChunks && (
                        <span className="flex items-center space-x-1">
                          <Layers className="w-3 h-3" />
                          <span>
                            {file.processedChunks}/{file.totalChunks} chunks
                          </span>
                        </span>
                      )}
                      {file.isOneDriveFile && (
                        <Badge variant="outline" className="text-xs">
                          OneDrive
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                  <Button
                    onClick={() => handleDownload(file)}
                    size="sm"
                    variant="outline"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
