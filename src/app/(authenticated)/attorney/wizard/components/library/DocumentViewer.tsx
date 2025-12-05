"use client";

import React from "react";
import Image from "next/image";
import { X, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentViewerProps {
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (fileId: string) => void;
}

export function DocumentViewer({
  fileId,
  fileName,
  fileType,
  fileSize,
  fileUrl,
  isOpen,
  onClose,
  onDownload,
}: DocumentViewerProps) {
  const isPdf = fileType.includes("pdf");
  const isImage =
    fileType.includes("image") ||
    fileType.includes("png") ||
    fileType.includes("jpg") ||
    fileType.includes("jpeg") ||
    fileType.includes("gif");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span className="truncate">{fileName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(fileId)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4">
          {isPdf ? (
            <iframe
              src={fileUrl}
              className="w-full h-full min-h-[600px] border rounded"
              title={fileName}
            />
          ) : isImage ? (
            <div className="flex justify-center items-center">
              <Image
                src={fileUrl}
                alt={fileName}
                width={800}
                height={600}
                className="max-w-full h-auto"
                style={{ objectFit: "contain" }}
                unoptimized
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
              <FileText className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium mb-2">Document Preview</p>
              <p className="text-sm mb-4">
                Preview not available for this file type. Please download to
                view.
              </p>
              <Button onClick={() => onDownload(fileId)}>
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
