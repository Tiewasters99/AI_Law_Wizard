"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Eye,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Search,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { DocumentViewer } from "./DocumentViewer";

interface DocumentFile {
  id: string;
  fileName: string;
  originalName: string;
  size: number;
  type: string;
  status: string;
  totalChunks: number;
  processedChunks: number;
  failedChunks: number;
  uploadedAt: string;
  modifiedAt: string;
  completedAt: string | null;
}

interface DocumentLibraryProps {
  className?: string;
}

const getFileIcon = (fileType: string) => {
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "PROCESSING":
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    case "FAILED":
      return <X className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-yellow-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "PROCESSING":
      return "bg-blue-100 text-blue-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
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

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  className,
}) => {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<DocumentFile | null>(
    null
  );
  const [showViewer, setShowViewer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadDocuments = async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        search: search,
      });

      console.log("Loading documents with params:", { page, search });
      const response = await fetch(`/api/files?${params}`);
      const data = await response.json();

      console.log("Documents API response:", data);

      if (data.success) {
        setDocuments(data.files);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
        console.log("Documents loaded:", data.files.length);
      } else {
        setError(data.error || "Failed to load documents");
        console.error("API error:", data.error);
      }
    } catch (error) {
      setError("Failed to load documents");
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    loadDocuments(1, value);
  };

  const handleView = (document: DocumentFile) => {
    setSelectedDocument(document);
    setShowViewer(true);
  };

  const handleDownload = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/download?fileId=${fileId}`);

      if (response.ok) {
        if (response.redirected) {
          window.open(response.url, "_blank");
        } else {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = selectedDocument?.originalName || "download";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }

        toast.success("Download Started - File download has started");
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      toast.error("Download Failed - Failed to download file");
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/files?jobId=${fileId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(
          "Document Deleted - Document has been deleted successfully"
        );
        loadDocuments(currentPage, searchTerm);
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      toast.error("Delete Failed - Failed to delete document");
    }
  };

  const filteredDocuments = documents.filter(
    doc =>
      doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className={className}>
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Document Library
              </span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadDocuments(currentPage, searchTerm)}
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={e => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500">
              {totalCount} document{totalCount !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading documents...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Error Loading Documents
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => loadDocuments()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Documents Found
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "No documents match your search."
                    : "No documents have been uploaded yet."}
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Total documents: {totalCount}</p>
                  <p>Documents in state: {documents.length}</p>
                  <p>Filtered documents: {filteredDocuments.length}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Documents Grid/List */}
              <motion.div
                className="space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {filteredDocuments.map(document => {
                    console.log("Rendering document:", document);
                    return (
                      <motion.div
                        key={document.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                          <CardContent className="p-4">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              {/* File Info Section */}
                              <div className="flex items-center space-x-4 flex-1 min-w-0">
                                {getFileIcon(document.type)}
                                <div className="flex-1 min-w-0">
                                  <h3
                                    className="font-medium text-gray-900 text-base mb-2"
                                    title={document.originalName}
                                  >
                                    {document.originalName}
                                  </h3>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                                    <span className="flex items-center space-x-1">
                                      <span className="font-medium">Size:</span>
                                      <span>
                                        {formatFileSize(document.size)}
                                      </span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <span className="font-medium">
                                        Uploaded:
                                      </span>
                                      <span>
                                        {formatDate(document.uploadedAt)}
                                      </span>
                                    </span>
                                    {document.status === "PROCESSING" && (
                                      <span className="flex items-center space-x-1 text-blue-600">
                                        <span className="font-medium">
                                          Progress:
                                        </span>
                                        <span>
                                          {document.processedChunks}/
                                          {document.totalChunks} chunks
                                        </span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Status and Actions Section */}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-shrink-0">
                                <Badge
                                  variant="secondary"
                                  className={`text-sm px-3 py-1 w-fit ${getStatusColor(
                                    document.status
                                  )}`}
                                >
                                  {getStatusIcon(document.status)}
                                  <span className="ml-2">
                                    {document.status}
                                  </span>
                                </Badge>

                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleView(document)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownload(document.id)}
                                    className="border-gray-300 hover:bg-gray-50"
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(document.id)}
                                    className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadDocuments(currentPage - 1, searchTerm)}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadDocuments(currentPage + 1, searchTerm)}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          fileId={selectedDocument.id}
          fileName={selectedDocument.originalName}
          fileType={selectedDocument.type}
          fileSize={selectedDocument.size}
          fileUrl={`/api/files/download?fileId=${selectedDocument.id}`}
          isOpen={showViewer}
          onClose={() => {
            setShowViewer(false);
            setSelectedDocument(null);
          }}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};



