"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { OneDriveFileInfo } from "@/types/onedrive";

export function useOneDriveFiles(isAuthenticated: boolean) {
  const [files, setFiles] = useState<OneDriveFileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState("root");
  const [folderPath, setFolderPath] = useState<string[]>(["Home"]);
  const [searchTerm, setSearchTerm] = useState("");

  // Load files from current folder
  const loadFiles = useCallback(
    async (folderId: string = currentFolder) => {
      if (!isAuthenticated) return;

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (folderId) params.append("folderId", folderId);
        if (searchTerm) params.append("search", searchTerm);
        params.append("pageSize", "100");
        params.append("orderBy", "name");

        const response = await fetch(
          `/api/attorney/onedrive?${params.toString()}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load files");
        }

        setFiles(data.files || []);
      } catch (error) {
        console.error("Error loading files:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to load files"
        );
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, currentFolder, searchTerm]
  );

  // Navigate to folder
  const navigateToFolder = useCallback(
    (folderId: string, folderName: string) => {
      setCurrentFolder(folderId);
      setFolderPath(prev => [...prev, folderName]);
    },
    []
  );

  // Navigate back
  const navigateBack = useCallback(() => {
    setFolderPath(prev => {
      if (prev.length > 1) {
        setCurrentFolder("root");
        return prev.slice(0, -1);
      }
      return prev;
    });
  }, []);

  // Load files when dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
    }
  }, [isAuthenticated, loadFiles]);

  return {
    files,
    loading,
    currentFolder,
    folderPath,
    searchTerm,
    setSearchTerm,
    loadFiles,
    navigateToFolder,
    navigateBack,
  };
}
