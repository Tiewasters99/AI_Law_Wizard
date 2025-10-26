"use client";

import React from "react";
import { OneDriveFileInfo } from "@/types/onedrive";
import { OneDriveFileItem } from "@/components/attorney/integrations/OneDriveFileItem";

interface OneDriveFileBrowserProps {
  files: OneDriveFileInfo[];
  loading: boolean;
  currentFolder: string;
  folderPath: string[];
  searchTerm: string;
  syncedFiles: Set<string>;
  selectedForSync: Set<string>;
  onFileSelect: (file: File) => void;
  onFolderSelect: (folderId: string, folderName: string) => void;
  onNavigateBack: () => void;
  onSearchChange: (term: string) => void;
  onToggleFileSelection: (fileId: string, e: React.MouseEvent) => void;
  onDownloadFile: (file: OneDriveFileInfo, e: React.MouseEvent) => void;
  onOpenFile: (file: OneDriveFileInfo, e: React.MouseEvent) => void;
  onFileSync: (file: OneDriveFileInfo, e: React.MouseEvent) => void;
}

export function OneDriveFileBrowser({
  files,
  loading,
  folderPath,
  searchTerm,
  syncedFiles,
  selectedForSync,
  onSearchChange,
  onToggleFileSelection,
  onDownloadFile,
  onOpenFile,
  onFileSync,
  onFileSelect,
  onFolderSelect,
  onNavigateBack,
}: OneDriveFileBrowserProps) {
  return (
    <div>
      <div className="mb-4 text-sm text-gray-600">{folderPath.join(" / ")}</div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No files found</p>
            {searchTerm && (
              <p className="text-sm mt-1">Try adjusting your search terms</p>
            )}
          </div>
        ) : (
          files.map(file => (
            <OneDriveFileItem
              key={file.id}
              file={file}
              syncedFiles={syncedFiles}
              selectedForSync={selectedForSync}
              onFileClick={
                file.isFolder
                  ? () => onFolderSelect(file.id, file.name)
                  : () => onFileSelect(null as any)
              }
              onToggleFileSelection={onToggleFileSelection}
              onDownloadFile={onDownloadFile}
              onOpenFile={onOpenFile}
              onFileSync={onFileSync}
            />
          ))
        )}
      </div>
    </div>
  );
}
