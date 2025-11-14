"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Folder, File } from "lucide-react";
import { OneDriveFileInfo } from "@/types/onedrive";
import { formatFileSize, getFileIcon } from "@/lib/frontend/onedriveUtils";

interface OneDriveFileItemProps {
  file: OneDriveFileInfo;
  syncedFiles: Set<string>;
  selectedForSync: Set<string>;
  onFileClick: (file: OneDriveFileInfo) => void;
  onToggleFileSelection: (fileId: string, e: React.MouseEvent) => void;
  onDownloadFile: (file: OneDriveFileInfo, e: React.MouseEvent) => void;
  onOpenFile: (file: OneDriveFileInfo, e: React.MouseEvent) => void;
  onFileSync: (file: OneDriveFileInfo, e: React.MouseEvent) => void;
}

const MAX_SELECTION_LIMIT = 40;

export function OneDriveFileItem({
  file,
  syncedFiles,
  selectedForSync,
  onFileClick,
  onToggleFileSelection,
  onDownloadFile,
  onOpenFile,
  onFileSync,
}: OneDriveFileItemProps) {
  const isSelected = selectedForSync.has(file.id);
  const isSynced = syncedFiles.has(file.id);
  const isTooLarge = file.size > 50 * 1024 * 1024;
  const isSelectionLimitReached =
    selectedForSync.size >= MAX_SELECTION_LIMIT && !isSelected;

  const handleFileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileClick(file);
  };

  const handleToggleSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggleFileSelection(file.id, e as any);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownloadFile(file, e);
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenFile(file, e);
  };

  const handleSync = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSync(file, e);
  };

  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
      } ${isSynced ? "opacity-75" : ""}`}
      onClick={handleFileClick}
    >
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        {/* Selection checkbox for files only */}
        {!file.isFolder && !isSynced && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleToggleSelection}
            disabled={isTooLarge || isSelectionLimitReached}
            className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
              isTooLarge || isSelectionLimitReached
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            title={
              isTooLarge
                ? "File too large (max 50MB)"
                : isSelectionLimitReached
                  ? `Selection limit reached (${MAX_SELECTION_LIMIT} files)`
                  : ""
            }
          />
        )}

        {/* File/Folder icon */}
        <div className="flex-shrink-0">
          {file.isFolder ? (
            <Folder className="w-5 h-5 text-blue-500" />
          ) : (
            <File className="w-5 h-5 text-gray-500" />
          )}
        </div>

        {/* File info */}
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900 truncate" title={file.name}>
            {file.name}
          </div>
          <div className="text-sm text-gray-500">
            {file.isFolder
              ? `${file.childCount} items`
              : formatFileSize(file.size)}
          </div>
        </div>
      </div>

      {/* Status badges and actions */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        {/* Status badges */}
        {file.isFolder && (
          <Badge variant="outline" className="text-xs">
            Folder
          </Badge>
        )}

        {!file.isFolder && isSynced && (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 text-xs"
          >
            ✓ Synced
          </Badge>
        )}

        {!file.isFolder && isTooLarge && (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 text-xs"
          >
            ⚠️ Too Large
          </Badge>
        )}

        {/* Action buttons for files only */}
        {!file.isFolder && (
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-7 px-2 text-xs"
              title="Download file"
            >
              <Download className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Download</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpen}
              className="h-7 px-2 text-xs"
              title="Open in OneDrive"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Open</span>
            </Button>

            {!isSynced && !isSelected && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isTooLarge}
                className="h-7 px-2 text-xs"
                title={isTooLarge ? "File too large (max 50MB)" : "Sync file"}
              >
                Sync
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
