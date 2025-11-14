"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ExternalLink,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Upload,
} from "lucide-react";

interface OneDriveFileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  isFolder: boolean;
  lastModified: string;
  childCount?: number;
}

interface FilesManagerProps {
  className?: string;
}

const getFileIcon = (fileType: string, isFolder: boolean = false) => {
  if (isFolder) return <FileText className="w-5 h-5 text-blue-500" />;
  if (fileType.includes("pdf"))
    return <FileText className="w-5 h-5 text-red-500" />;
  if (fileType.includes("image"))
    return <Image className="w-5 h-5 text-blue-500" />;
  if (fileType.includes("video"))
    return <Video className="w-5 h-5 text-purple-500" />;
  if (fileType.includes("audio"))
    return <Music className="w-5 h-5 text-green-500" />;
  if (fileType.includes("zip") || fileType.includes("rar"))
    return <Archive className="w-5 h-5 text-orange-500" />;
  return <FileText className="w-5 h-5 text-gray-500" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const FilesManager: React.FC<FilesManagerProps> = ({ className }) => {
  const { data: session } = useSession();
  const [files, setFiles] = useState<OneDriveFileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFolder, setCurrentFolder] = useState("root");
  const [folderPath, setFolderPath] = useState<string[]>(["Home"]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [syncingFiles, setSyncingFiles] = useState<Set<string>>(new Set());
  const [syncedFiles, setSyncedFiles] = useState<Set<string>>(new Set());
  const [selectedForSync, setSelectedForSync] = useState<Set<string>>(
    new Set()
  );
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({
    processed: 0,
    total: 0,
    current: "",
  });
  const [batchErrors, setBatchErrors] = useState<
    Array<{ fileName: string; error: string }>
  >([]);

  const MAX_SELECTION_LIMIT = 40;

  // Load files from OneDrive
  const loadFiles = useCallback(
    async (folderId: string = currentFolder) => {
      if (!isAuthenticated) return;

      setLoading(true);
      try {
        const response = await fetch(
          `/api/onedrive?folderId=${folderId}&search=${searchTerm}`
        );
        const data = await response.json();

        if (data.success && data.files) {
          setFiles(data.files);
          await checkSyncStatus(data.files);
        } else {
          if (data.error?.includes("Authentication required")) {
            setIsAuthenticated(false);
            toast.error(
              "Authentication Required - Please sign in to OneDrive to access your files"
            );
          } else {
            toast.error(`Error - ${data.error || "Failed to load files"}`);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes("authenticate")) {
          setIsAuthenticated(false);
          toast.error(
            "Authentication Required - Please sign in to access OneDrive"
          );
        } else {
          toast.error("Error - Failed to load files from OneDrive");
        }
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, currentFolder, searchTerm]
  );

  // Check sync status for files
  const checkSyncStatus = useCallback(async (fileList: OneDriveFileInfo[]) => {
    try {
      const fileIds = fileList
        .filter(file => !file.isFolder)
        .map(file => file.id);

      if (fileIds.length === 0) return;

      const response = await fetch("/api/embedding/synced-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds }),
      });

      const data = await response.json();
      if (data.success && data.syncedFiles) {
        const syncedIds = new Set<string>(
          data.syncedFiles.map((file: any) => file.oneDriveId as string)
        );
        setSyncedFiles(syncedIds);
      }
    } catch (error) {
      console.error("Error checking sync status:", error);
    }
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/onedrive/auth-status");
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        if (data.authenticated) {
          loadFiles();
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };

    checkAuth();
  }, [loadFiles]);

  // Load files when authenticated and dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
    }
  }, [currentFolder, searchTerm, isAuthenticated, loadFiles]);

  // Handle authentication
  const handleSignIn = useCallback(async () => {
    setAuthLoading(true);
    try {
      const response = await fetch("/api/onedrive/auth-url");
      const data = await response.json();

      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error("Error - Failed to start authentication");
      }
    } catch (error) {
      toast.error("Error - Failed to start authentication");
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(() => {
    fetch("/api/onedrive/logout", { method: "POST" });
    setIsAuthenticated(false);
    setFiles([]);
    toast.success("Signed Out - You have been signed out of OneDrive");
  }, []);

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

  // Handle file sync to embedding system
  const handleFileSync = useCallback(
    async (file: OneDriveFileInfo, e: React.MouseEvent) => {
      e.stopPropagation();

      if (file.isFolder) {
        toast.error("Error - Cannot sync folders to embedding system");
        return;
      }

      if (syncedFiles.has(file.id)) {
        toast.error(
          "Already Synced - File is already synced to the embedding system"
        );
        return;
      }

      if (syncingFiles.has(file.id)) {
        return;
      }

      setSyncingFiles(prev => new Set(prev).add(file.id));

      try {
        const response = await fetch("/api/onedrive/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId: file.id }),
        });

        const data = await response.json();

        if (data.success) {
          setSyncedFiles(prev => new Set(prev).add(file.id));
          toast.success(
            `Sync Successful - File "${file.name}" has been synced to the embedding system`
          );
        } else {
          throw new Error(data.error || "Failed to sync file");
        }
      } catch (error) {
        console.error("Error syncing file:", error);
        toast.error(
          `Sync Failed - ${error instanceof Error ? error.message : "Failed to sync file to embedding system"}`
        );
      } finally {
        setSyncingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(file.id);
          return newSet;
        });
      }
    },
    [syncedFiles, syncingFiles]
  );

  // Toggle file selection for sync
  const toggleFileSelection = useCallback(
    (fileId: string, e: React.MouseEvent) => {
      e.stopPropagation();

      const file = files.find(f => f.id === fileId);
      if (file && file.size > 50 * 1024 * 1024) {
        toast.error(
          `File Too Large - "${file.name}" is ${formatFileSize(file.size)}. Maximum size is 50MB.`
        );
        return;
      }

      setSelectedForSync(prev => {
        const newSet = new Set(prev);
        if (newSet.has(fileId)) {
          newSet.delete(fileId);
        } else {
          if (newSet.size >= MAX_SELECTION_LIMIT) {
            toast.error(
              `Selection Limit Reached - You can only select up to ${MAX_SELECTION_LIMIT} files at once.`
            );
            return prev;
          }
          newSet.add(fileId);
        }
        return newSet;
      });
    },
    [files]
  );

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>OneDrive Integration</span>
            <Badge variant="secondary">Authentication Required</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connect to OneDrive
              </h3>
              <p className="text-gray-600">
                Sign in with your Microsoft account to access your OneDrive
                files.
              </p>
            </div>
            <Button
              onClick={handleSignIn}
              disabled={authLoading}
              className="w-full max-w-xs"
            >
              {authLoading ? "Connecting..." : "Sign in with Microsoft"}
            </Button>
            <div className="mt-4 text-sm text-gray-500">
              <p>This will allow you to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Browse your OneDrive files and folders</li>
                <li>Sync files to the embedding system</li>
                <li>Search through your files</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
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
            <Button variant="outline" size="sm" onClick={handleSignOut}>
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600">
          {folderPath.join(" / ")}
        </div>

        {/* File List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
              <span className="text-gray-600">Loading files...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No files found</div>
          ) : (
            files.map(file => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                  selectedForSync.has(file.id)
                    ? "border-blue-500 bg-blue-50"
                    : ""
                }`}
                onClick={() => {
                  if (file.isFolder) {
                    navigateToFolder(file.id, file.name);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  {!file.isFolder && (
                    <input
                      type="checkbox"
                      checked={selectedForSync.has(file.id)}
                      onChange={e => toggleFileSelection(file.id, e as any)}
                      onClick={e => e.stopPropagation()}
                      disabled={
                        file.size > 50 * 1024 * 1024 ||
                        (selectedForSync.size >= MAX_SELECTION_LIMIT &&
                          !selectedForSync.has(file.id))
                      }
                      className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
                        file.size > 50 * 1024 * 1024 ||
                        (selectedForSync.size >= MAX_SELECTION_LIMIT &&
                          !selectedForSync.has(file.id))
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  )}
                  <span className="text-xl">
                    {getFileIcon(file.type, file.isFolder)}
                  </span>
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-gray-500">
                      {file.isFolder
                        ? `${file.childCount} items`
                        : formatFileSize(file.size)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {file.isFolder && <Badge variant="outline">Folder</Badge>}
                  {!file.isFolder && syncedFiles.has(file.id) && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      ✓ Synced
                    </Badge>
                  )}
                  {!file.isFolder && file.size > 50 * 1024 * 1024 && (
                    <Badge
                      variant="destructive"
                      className="bg-red-100 text-red-800"
                    >
                      ⚠️ Too Large (50MB+)
                    </Badge>
                  )}

                  {/* Action buttons for files */}
                  {!file.isFolder && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e: React.MouseEvent) =>
                          handleFileSync(file, e)
                        }
                        disabled={
                          syncingFiles.has(file.id) ||
                          file.size > 50 * 1024 * 1024
                        }
                        title={
                          file.size > 50 * 1024 * 1024
                            ? "File too large (max 50MB)"
                            : ""
                        }
                        className="h-7 px-2"
                      >
                        {syncingFiles.has(file.id) ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Sync"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};



