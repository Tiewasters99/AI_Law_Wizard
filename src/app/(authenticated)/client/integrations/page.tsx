"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  Search,
  Download,
  Trash2,
  Eye,
  MoreVertical,
  Cloud,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OneDriveInterface } from "@/components/client/integrations/OneDriveInterface";
import { DocumentUploader } from "@/components/client/integrations/DocumentUploader";
import { useOneDriveAuth } from "@/hooks/useOneDriveAuth";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  status: "processing" | "ready" | "error";
  url: string;
  thumbnail?: string;
  metadata?: {
    pages?: number;
    author?: string;
    created?: Date;
    modified?: Date;
  };
}

interface Integration {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  status: "connected" | "available" | "coming_soon";
  color: string;
  component?: React.ComponentType<any>;
}

export default function IntegrationsPage() {
  const { data: session } = useSession();
  const { isAuthenticated: isOneDriveConnected } = useOneDriveAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [activeView, setActiveView] = useState("integrations");
  const [activeIntegration, setActiveIntegration] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isUploaderCollapsed, setIsUploaderCollapsed] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Define available integrations
  const integrations: Integration[] = [
    {
      id: "upload",
      name: "Manual Upload",
      icon: <Upload className="w-6 h-6" />,
      description: "Upload files directly from your computer",
      status: "connected",
      color: "green",
    },
    {
      id: "onedrive",
      name: "Microsoft OneDrive",
      icon: <Cloud className="w-6 h-6" />,
      description: "Connect your OneDrive account to sync files",
      status: isOneDriveConnected ? "connected" : "available",
      color: "blue",
      component: OneDriveInterface,
    },
    {
      id: "googledrive",
      name: "Google Drive",
      icon: <Cloud className="w-6 h-6" />,
      description: "Connect your Google Drive account",
      status: "coming_soon",
      color: "green",
    },
  ];

  // Fetch files from API
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
      });

      const response = await fetch(`/api/client/files?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }
      const data = await response.json();
      if (data.success) {
        const filesData = (data.files || []).map((file: any) => ({
          id: file.id,
          name: file.originalName,
          type: file.fileName.split(".").pop() || "application/octet-stream",
          size: file.size,
          uploadedAt: new Date(file.uploadedAt),
          status:
            file.status === "COMPLETED" ? "ready" : file.status.toLowerCase(),
          url: file.path,
          isOneDriveFile: file.isOneDriveFile,
          oneDriveId: file.oneDriveId,
        }));
        setDocuments(filesData);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to load files. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchQuery]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const filteredDocuments = useMemo(
    () =>
      documents.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [documents, searchQuery]
  );

  const handleFileUpload = async (files: FileList) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append("files", file);
      });

      const response = await fetch("/api/client/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to upload files");
      }

      setSuccess(
        `${data.files?.length || files.length} file(s) uploaded successfully!`
      );
      setTimeout(() => setSuccess(null), 3000);

      // Refresh file list
      await fetchFiles();
    } catch (error) {
      console.error("Error uploading files:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload files. Please try again."
      );
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/client/files?fileId=${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      setSuccess("File deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
      await fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
      setError("Failed to delete file. Please try again.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
    if (type.includes("image")) return "🖼️";
    return "📄";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case "ready":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading && documents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Document Management
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                Upload, manage, and analyze your legal documents with AI
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {documents.length}
                    </div>
                    <div className="text-sm text-gray-500">Documents</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {documents.filter(d => d.status === "ready").length}
                    </div>
                    <div className="text-sm text-gray-500">Ready</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm sm:text-base text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm sm:text-base">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Integration Cards View */}
        {activeView === "integrations" && !activeIntegration ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Integrations
              </h2>
              <p className="text-muted-foreground">
                Connect your cloud storage or upload files directly
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {integrations.map(integration => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => {
                    if (integration.status !== "coming_soon") {
                      if (integration.id === "upload") {
                        setActiveView("documents");
                        setActiveIntegration("upload");
                      } else {
                        setActiveIntegration(integration.id);
                        setActiveView("documents");
                      }
                    }
                  }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          {integration.icon}
                        </div>
                        {integration.status === "connected" && (
                          <Badge className="bg-green-100 text-green-800">
                            Connected
                          </Badge>
                        )}
                        {integration.status === "coming_soon" && (
                          <Badge variant="secondary">Coming Soon</Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {integration.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {integration.description}
                      </p>
                      {integration.status === "coming_soon" ? (
                        <Button variant="outline" disabled className="w-full">
                          Coming Soon
                        </Button>
                      ) : (
                        <Button className="w-full">
                          {integration.status === "connected"
                            ? "Open"
                            : "Connect"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ) : activeView === "documents" || activeIntegration === "upload" ? (
          /* Document Management Interface */
          <div className="space-y-6">
            {/* Document Uploader */}
            <DocumentUploader
              documents={documents}
              onUpload={handleFileUpload}
              onDelete={handleDeleteDocument}
              isLoading={isLoading}
              isCollapsed={isUploaderCollapsed}
              onCollapseChange={setIsUploaderCollapsed}
            />

            {/* Document List */}
            {documents.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <CardTitle className="text-base sm:text-lg">
                      All Documents
                    </CardTitle>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search documents..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="pl-10 w-full sm:w-64"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredDocuments.map(document => (
                      <motion.div
                        key={document.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-border rounded-lg hover:bg-muted/50 gap-3 sm:gap-0"
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 w-full sm:w-auto">
                          <div className="text-xl sm:text-2xl flex-shrink-0">
                            {getFileIcon(document.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-foreground text-sm sm:text-base truncate">
                                {document.name}
                              </h3>
                              {getStatusIcon(document.status)}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                              <span>{formatFileSize(document.size)}</span>
                              <span>
                                {document.uploadedAt.toLocaleDateString()}
                              </span>
                              {document.metadata?.pages && (
                                <span>{document.metadata.pages} pages</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end sm:justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDocument(document)}
                            className="h-9 text-xs sm:text-sm"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteDocument(document.id)
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    ))}

                    {filteredDocuments.length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No documents found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Integration View (OneDrive, etc.) */
          activeIntegration &&
          activeIntegration !== "upload" && (
            <div className="space-y-6">
              {activeIntegration && (
                <div className="flex items-center space-x-4 mb-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveIntegration(null);
                      setActiveView("integrations");
                    }}
                  >
                    ← Back to Integrations
                  </Button>
                  <div className="flex items-center space-x-2">
                    {integrations.find(i => i.id === activeIntegration)?.icon}
                    <h2 className="text-2xl font-bold">
                      {integrations.find(i => i.id === activeIntegration)?.name}
                    </h2>
                  </div>
                </div>
              )}

              {activeIntegration === "onedrive" && (
                <OneDriveInterface
                  showSync={true}
                  onFileSync={() => {
                    fetchFiles();
                    toast.success("Files synced successfully!");
                  }}
                />
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
