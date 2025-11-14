"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  ExternalLink,
  Cloud,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { OneDriveAuthSection } from "./OneDriveAuthSection";
import { OneDriveSyncControls } from "./OneDriveSyncControls";
import { OneDriveFileBrowser } from "./OneDriveFileBrowser";
import { useOneDriveAuth } from "@/hooks/useOneDriveAuth";
import { useOneDriveFiles } from "@/hooks/useOneDriveFiles";

interface OneDriveInterfaceProps {
  onFileSelect?: (file: File) => void;
  onFolderSelect?: (folderId: string, folderName: string) => void;
  onFileSync?: (files: any[]) => void;
  showUpload?: boolean;
  showDownload?: boolean;
  showSync?: boolean;
  className?: string;
}

export function OneDriveInterface({
  onFileSelect,
  onFolderSelect,
  onFileSync,
  showUpload = true,
  showDownload = true,
  showSync = false,
  className = "",
}: OneDriveInterfaceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    isAuthenticated,
    isLoading: authLoading,
    signIn,
    signOut,
  } = useOneDriveAuth();

  const {
    files,
    loading: filesLoading,
    currentFolder,
    folderPath,
    searchTerm,
    setSearchTerm,
    loadFiles,
    navigateToFolder,
    navigateBack,
  } = useOneDriveFiles(isAuthenticated, "client");

  // Local state for file management
  const [syncedFiles, setSyncedFiles] = useState<Set<string>>(new Set());
  const [selectedForSync, setSelectedForSync] = useState<Set<string>>(
    new Set()
  );

  // Handle OAuth callback results
  const handleOAuthCallback = useCallback(() => {
    const error = searchParams.get("error");
    const success = searchParams.get("success");

    if (error) {
      toast.error(decodeURIComponent(error));
      router.replace("/client/integrations");
    }

    if (success) {
      toast.success("You are now connected to OneDrive!");
      router.replace("/client/integrations");
    }
  }, [searchParams, router]);

  useEffect(() => {
    handleOAuthCallback();
  }, [handleOAuthCallback]);

  // Load files when authenticated
  const handleLoadFiles = useCallback(() => {
    if (isAuthenticated) {
      loadFiles();
    }
  }, [isAuthenticated, loadFiles]);

  useEffect(() => {
    handleLoadFiles();
  }, [handleLoadFiles]);

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <OneDriveAuthSection
        onSignIn={() => signIn("client")}
        loading={authLoading}
        className={className}
      />
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <span className="text-base font-medium">OneDrive Files</span>
            <Badge variant="secondary" className="text-xs">
              {files.length} items
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
            {folderPath.length > 1 && (
              <Button variant="outline" size="sm" onClick={navigateBack}>
                ← Back
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Sync Controls */}
        {showSync && (
          <OneDriveSyncControls
            files={files}
            onFileSync={onFileSync}
            className="mb-4"
          />
        )}

        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600">
          {folderPath.join(" / ")}
        </div>

        {/* File Browser */}
        <OneDriveFileBrowser
          files={files}
          loading={filesLoading}
          currentFolder={currentFolder}
          folderPath={folderPath}
          searchTerm={searchTerm}
          syncedFiles={syncedFiles}
          selectedForSync={selectedForSync}
          onFileSelect={onFileSelect || (() => {})}
          onFolderSelect={onFolderSelect || (() => {})}
          onNavigateBack={navigateBack}
          onSearchChange={setSearchTerm}
          onToggleFileSelection={() => {}}
          onDownloadFile={() => {}}
          onOpenFile={() => {}}
          onFileSync={(file, e) => {
            if (onFileSync) {
              onFileSync([file]);
            }
          }}
        />
      </CardContent>
    </Card>
  );
}

